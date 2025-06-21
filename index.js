const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Cloudinary configuration
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ph-cluster.8kwdmtt.mongodb.net/?retryWrites=true&w=majority&appName=PH-Cluster`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Database and collections references
const database = client.db("plantopia");
const collections = {
  plants: database.collection("plants"),
  tools: database.collection("tools"),
  soils: database.collection("soils"),
  fertilizers: database.collection("fertilizers"),
  users: database.collection("users"),
  orders: database.collection("orders"),
  blogs: database.collection("blogs"),
};

async function run() {
  try {
    await client.connect();

    // User related endpoints
    // Create or update user on registration/login
    app.post('/api/users', async (req, res) => {
      try {
        const userData = {
          ...req.body,
          cart: req.body.cart || [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await collections.users.updateOne(
          { uid: userData.uid },
          { 
            $set: userData,
            $setOnInsert: { role: 'user' }
          },
          { upsert: true }
        );

        res.json({
          success: true,
          message: result.upsertedCount ? 'User created successfully' : 'User updated successfully'
        });
      } catch (error) {
        console.error('Error handling user data:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to handle user data'
        });
      }
    });

    // Get user profile
    app.get('/api/users/:uid', async (req, res) => {
      try {
        const user = await collections.users.findOne({ uid: req.params.uid });
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        // Sort orders by creation date (most recent first)
        if (user.orders && user.orders.length > 0) {
          user.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        res.json({
          success: true,
          data: user
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch user data'
        });
      }
    });

    // Update user profile (including shipping address)
    app.put('/api/users/:uid', async (req, res) => {
      try {
        const { uid } = req.params;
        const updateData = req.body;

        // If there's a $push operator, it means we're adding an order
        if (updateData.$push?.orders) {
          const result = await collections.users.updateOne(
            { uid },
            { 
              $push: { orders: updateData.$push.orders },
              $set: {
                shippingAddress: updateData.shippingAddress,
                updatedAt: new Date()
              }
            }
          );

          if (result.matchedCount === 0) {
            return res.status(404).json({
              success: false,
              message: 'User not found'
            });
          }
        } else {
          // Regular user update
          const result = await collections.users.updateOne(
            { uid },
            { 
              $set: {
                ...updateData,
                updatedAt: new Date()
              }
            }
          );

          if (result.matchedCount === 0) {
            return res.status(404).json({
              success: false,
              message: 'User not found'
            });
          }
        }

        res.json({
          success: true,
          message: 'User updated successfully'
        });
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update user'
        });
      }
    });

    // Add product to wishlist
    app.post('/api/users/:uid/wishlist', async (req, res) => {
      try {
        const { uid } = req.params;
        const { productId, productType } = req.body;

        if (!productId || !productType) {
          return res.status(400).json({
            success: false,
            message: 'Product ID and type are required'
          });
        }

        // Check if product exists
        if (!collections[productType]) {
          return res.status(404).json({
            success: false,
            message: 'Invalid product type'
          });
        }

        const product = await collections[productType].findOne({ _id: new ObjectId(productId) });
        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Product not found'
          });
        }

        // Add to wishlist (avoid duplicates)
        const result = await collections.users.updateOne(
          { uid },
          { 
            $addToSet: { 
              wishlist: {
                productId,
                productType,
                addedAt: new Date()
              }
            },
            $set: { updatedAt: new Date() }
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        res.json({
          success: true,
          message: 'Product added to wishlist'
        });
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to add to wishlist'
        });
      }
    });

    // Remove product from wishlist
    app.delete('/api/users/:uid/wishlist/:productId', async (req, res) => {
      try {
        const { uid, productId } = req.params;

        const result = await collections.users.updateOne(
          { uid },
          { 
            $pull: { 
              wishlist: { productId }
            },
            $set: { updatedAt: new Date() }
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        res.json({
          success: true,
          message: 'Product removed from wishlist'
        });
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to remove from wishlist'
        });
      }
    });

    // Get user's wishlist with product details
    app.get('/api/users/:uid/wishlist', async (req, res) => {
      try {
        const { uid } = req.params;

        const user = await collections.users.findOne({ uid });
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        if (!user.wishlist || user.wishlist.length === 0) {
          return res.json({
            success: true,
            data: []
          });
        }

        // Get product details for each wishlist item
        const wishlistWithDetails = await Promise.all(
          user.wishlist.map(async (item) => {
            try {
              const product = await collections[item.productType].findOne({ _id: new ObjectId(item.productId) });
              return {
                ...item,
                product: product || null
              };
            } catch (error) {
              console.error(`Error fetching product ${item.productId}:`, error);
              return {
                ...item,
                product: null
              };
            }
          })
        );

        // Filter out products that no longer exist
        const validWishlistItems = wishlistWithDetails.filter(item => item.product !== null);

        res.json({
          success: true,
          data: validWishlistItems
        });
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch wishlist'
        });
      }
    });

    // Cart endpoints
    // Get user's cart
    app.get('/api/cart/:uid', async (req, res) => {
      try {
        const user = await collections.users.findOne({ uid: req.params.uid });
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }
        res.json({
          success: true,
          data: user.cart || []
        });
      } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch cart'
        });
      }
    });

    // Update user's cart
    app.put('/api/cart/:uid', async (req, res) => {
      try {
        const { uid } = req.params;
        const { cart } = req.body;

        const result = await collections.users.updateOne(
          { uid },
          { 
            $set: { 
              cart,
              updatedAt: new Date()
            }
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        res.json({
          success: true,
          message: 'Cart updated successfully'
        });
      } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update cart'
        });
      }
    });

    // Order endpoints
    // Create new order
    app.post('/api/orders', async (req, res) => {
      try {
        // Validate required fields
        const { userId, items, shipping, summary } = req.body;
        if (!userId || !items || !shipping || !summary) {
          return res.status(400).json({
            success: false,
            message: 'Missing required fields'
          });
        }

        // Format the items to ensure proper ID handling
        const formattedItems = items.map(item => {
          // Remove any existing _id to let MongoDB generate a new one
          const { _id, ...itemWithoutId } = item;
          return {
            ...itemWithoutId,
            productId: item._id // Store the original product ID
          };
        });

        const orderData = {
          userId,
          items: formattedItems,
          shipping,
          summary,
          status: 'pending',
          paymentMethod: req.body.paymentMethod || 'cod',
          paymentStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

        // Insert into orders collection
        const result = await collections.orders.insertOne(orderData);

        if (result.acknowledged) {
          const orderId = result.insertedId.toString();
          
          // Prepare order data for user document
          const orderForUser = {
            ...orderData,
            _id: orderId,
            items: formattedItems // Use the formatted items
          };

          // Update user's document
          await collections.users.updateOne(
            { uid: userId },
            { 
              $push: { orders: orderForUser },
              $set: { 
                shippingAddress: shipping,
                updatedAt: new Date() 
              }
            }
          );

          res.json({
            success: true,
            message: 'Order created successfully',
            orderId: orderId
          });
        } else {
          throw new Error('Failed to create order');
        }
      } catch (error) {
        console.error('Error creating order:', error);
        console.error('Request body:', JSON.stringify(req.body, null, 2));
        res.status(500).json({
          success: false,
          message: 'Failed to create order',
          error: error.message
        });
      }
    });

    // Get user's orders
    app.get('/api/users/:uid/orders', async (req, res) => {
      try {
        const { uid } = req.params;
        const user = await collections.users.findOne({ uid });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        // Sort orders by creation date (most recent first)
        const sortedOrders = (user.orders || []).sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.json({
          success: true,
          data: sortedOrders
        });
      } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch orders'
        });
      }
    });

    // Update order status
    app.put('/api/orders/:orderId/status', async (req, res) => {
      try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'accepted', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid status value'
          });
        }

        // First, update the order in orders collection
        const result = await collections.orders.updateOne(
          { _id: new ObjectId(orderId) },
          { 
            $set: { 
              status,
              updatedAt: new Date()
            }
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'Order not found'
          });
        }

        // Get the updated order
        const updatedOrder = await collections.orders.findOne({ _id: new ObjectId(orderId) });

        // Update the order status in user's profile
        if (updatedOrder.userId) {
          await collections.users.updateOne(
            { 
              uid: updatedOrder.userId,
              "orders._id": orderId.toString() // Convert to string to match stored format
            },
            { 
              $set: { 
                "orders.$.status": status,
                updatedAt: new Date()
              }
            }
          );
        }

        res.json({
          success: true,
          message: 'Order status updated successfully',
          data: updatedOrder
        });
      } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update order status'
        });
      }
    });

    // Delete order
    app.delete('/api/orders/:orderId', async (req, res) => {
      try {
        const { orderId } = req.params;
        const { userId } = req.body; // User ID to verify ownership

        if (!userId) {
          return res.status(400).json({
            success: false,
            message: 'User ID required'
          });
        }

        // First, find the order to verify ownership
        const order = await collections.orders.findOne({ _id: new ObjectId(orderId) });
        if (!order) {
          return res.status(404).json({
            success: false,
            message: 'Order not found'
          });
        }

        // Check if user owns the order
        if (order.userId !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You can only delete your own orders'
          });
        }

        // Delete the order from orders collection
        const result = await collections.orders.deleteOne({ _id: new ObjectId(orderId) });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'Order not found'
          });
        }

        // Remove the order from user's orders array
        await collections.users.updateOne(
          { uid: userId },
          { 
            $pull: { 
              orders: { _id: orderId.toString() } // Convert to string to match stored format
            },
            $set: { updatedAt: new Date() }
          }
        );

        res.json({
          success: true,
          message: 'Order deleted successfully'
        });

      } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to delete order'
        });
      }
    });

    // Get all orders (for admin)
    app.get('/api/orders', async (req, res) => {
      try {
        const orders = await collections.orders.find().sort({ createdAt: -1 }).toArray();
        res.json({
          success: true,
          data: orders
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch orders'
        });
      }
    });

    // Generic function to handle product creation
    const handleProductCreation = async (req, res, collectionName) => {
      try {
        const productData = {
          ...req.body,
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await collections[collectionName].insertOne(productData);
        
        res.status(201).json({
          success: true,
          message: `${collectionName.slice(0, -1)} added successfully`,
          insertedId: result.insertedId
        });
      } catch (error) {
        console.error(`Error adding ${collectionName.slice(0, -1)}:`, error);
        res.status(500).json({
          success: false,
          message: `Failed to add ${collectionName.slice(0, -1)}`
        });
      }
    };

    // Product creation endpoints
    app.post('/api/plants', (req, res) => handleProductCreation(req, res, 'plants'));
    app.post('/api/tools', (req, res) => handleProductCreation(req, res, 'tools'));
    app.post('/api/soils', (req, res) => handleProductCreation(req, res, 'soils'));
    app.post('/api/fertilizers', (req, res) => handleProductCreation(req, res, 'fertilizers'));

    // Blog endpoints
    // Create a new blog post
    app.post('/api/blogs', async (req, res) => {
      try {
        const blogData = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result = await collections.blogs.insertOne(blogData);
        res.status(201).json({
          success: true,
          message: 'Blog post created successfully',
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ success: false, message: 'Failed to create blog post' });
      }
    });

    // Get all blog posts
    app.get('/api/blogs', async (req, res) => {
      try {
        const blogs = await collections.blogs.find().sort({ createdAt: -1 }).toArray();
        res.json({ success: true, data: blogs });
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch blog posts' });
      }
    });

    // Get a single blog post by ID
    app.get('/api/blogs/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const blog = await collections.blogs.findOne({ _id: new ObjectId(id) });
        if (!blog) {
          return res.status(404).json({ success: false, message: 'Blog post not found' });
        }
        res.json({ success: true, data: blog });
      } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch blog post' });
      }
    });

    // Update a blog post
    app.put('/api/blogs/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = { ...req.body, updatedAt: new Date() };
        const result = await collections.blogs.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, message: 'Blog post not found' });
        }
        const updatedBlog = await collections.blogs.findOne({ _id: new ObjectId(id) });
        res.json({ success: true, message: 'Blog post updated successfully', data: updatedBlog });
      } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ success: false, message: 'Failed to update blog post' });
      }
    });

    // Delete a blog post
    app.delete('/api/blogs/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await collections.blogs.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ success: false, message: 'Blog post not found' });
        }
        res.json({ success: true, message: 'Blog post deleted successfully' });
      } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({ success: false, message: 'Failed to delete blog post' });
      }
    });

    // Get all products of a specific type
    app.get('/api/:type', async (req, res) => {
      try {
        const { type } = req.params;
        if (!collections[type]) {
          return res.status(404).json({
            success: false,
            message: 'Invalid product type'
          });
        }

        const products = await collections[type].find().toArray();
        res.json({
          success: true,
          data: products
        });
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch products'
        });
      }
    });

    // Get a single product by ID
    app.get('/api/:type/:id', async (req, res) => {
      try {
        const { type, id } = req.params;
        if (!collections[type]) {
          return res.status(404).json({
            success: false,
            message: 'Invalid product type'
          });
        }

        const product = await collections[type].findOne({ _id: new ObjectId(id) });
        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Product not found'
          });
        }

        res.json({
          success: true,
          data: product
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch product'
        });
      }
    });

    // Update a product
    app.put('/api/:type/:id', async (req, res) => {
      try {
        const { type, id } = req.params;
        if (!collections[type]) {
          return res.status(404).json({
            success: false,
            message: 'Invalid product type'
          });
        }

        const updateData = {
          ...req.body,
          updatedAt: new Date()
        };

        const result = await collections[type].updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'Product not found'
          });
        }

        // Return the updated product
        const updatedProduct = await collections[type].findOne({ _id: new ObjectId(id) });
        
        res.json({
          success: true,
          message: 'Product updated successfully',
          data: updatedProduct
        });
      } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update product'
        });
      }
    });

    // Delete a product
    app.delete('/api/:type/:id', async (req, res) => {
      try {
        const { type, id } = req.params;
        if (!collections[type]) {
          return res.status(404).json({
            success: false,
            message: 'Invalid product type'
          });
        }

        const result = await collections[type].deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'Product not found'
          });
        }

        res.json({
          success: true,
          message: 'Product deleted successfully',
          deletedId: id
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to delete product'
        });
      }
    });

    // Add a comment to a product
    app.post('/api/:type/:id/comments', async (req, res) => {
      try {
        const { type, id } = req.params;
        const { user, text } = req.body;
    
        if (!user || !text) {
          return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
    
        if (!collections[type]) {
          return res.status(404).json({ success: false, message: 'Invalid product type' });
        }
        
        const newComment = {
          _id: new ObjectId(),
          user: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          text,
          createdAt: new Date(),
          replies: []
        };
    
        const result = await collections[type].updateOne(
          { _id: new ObjectId(id) },
          { $push: { comments: { $each: [newComment], $position: 0 } } }
        );
    
        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }
    
        res.status(201).json({ success: true, message: 'Comment added successfully', data: newComment });
    
      } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Failed to add comment' });
      }
    });
    
    // Add a reply to a comment
    app.post('/api/:type/:id/comments/:commentId/replies', async (req, res) => {
      try {
        const { type, id, commentId } = req.params;
        const { user, text } = req.body;
    
        if (!user || !text) {
          return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        if (!collections[type]) {
          return res.status(404).json({ success: false, message: 'Invalid product type' });
        }
    
        const newReply = {
          _id: new ObjectId(),
          user: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          text,
          createdAt: new Date()
        };
    
        const result = await collections[type].updateOne(
          { _id: new ObjectId(id), 'comments._id': new ObjectId(commentId) },
          { $push: { 'comments.$.replies': newReply } }
        );
    
        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, message: 'Product or comment not found' });
        }
    
        res.status(201).json({ success: true, message: 'Reply added successfully', data: newReply });
    
      } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ success: false, message: 'Failed to add reply' });
      }
    });

    // Delete a comment
    app.delete('/api/:type/:id/comments/:commentId', async (req, res) => {
      try {
        const { type, id, commentId } = req.params;
        const { userUid } = req.body; // User ID to verify ownership
    
        if (!userUid) {
          return res.status(400).json({ success: false, message: 'User ID required' });
        }
        
        if (!collections[type]) {
          return res.status(404).json({ success: false, message: 'Invalid product type' });
        }
    
        // First, find the comment to verify ownership
        const product = await collections[type].findOne({ _id: new ObjectId(id) });
        if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }
    
        const comment = product.comments?.find(c => c._id.toString() === commentId);
        if (!comment) {
          return res.status(404).json({ success: false, message: 'Comment not found' });
        }
    
        // Check if user owns the comment
        if (comment.user.uid !== userUid) {
          return res.status(403).json({ success: false, message: 'You can only delete your own comments' });
        }
    
        // Delete the comment
        const result = await collections[type].updateOne(
          { _id: new ObjectId(id) },
          { $pull: { comments: { _id: new ObjectId(commentId) } } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }
    
        res.json({ success: true, message: 'Comment deleted successfully' });
    
      } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ success: false, message: 'Failed to delete comment' });
      }
    });

    // Create payment intent for Stripe
    app.post("/api/create-payment-intent", async (req, res) => {
      try {
        const { amount, currency } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount), // Ensure amount is an integer
          currency: currency,
          payment_method_types: ["card"],
        });

        res.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to create payment intent",
          error: error.message,
        });
      }
    });

    // Make user admin (for development/testing purposes)
    app.post("/api/make-admin", async (req, res) => {
      try {
        const { email } = req.body;
        
        if (!email) {
          return res.status(400).json({
            success: false,
            message: 'Email is required'
          });
        }

        const result = await collections.users.updateOne(
          { email: email },
          { $set: { role: 'admin', updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'User not found with this email'
          });
        }

        res.json({
          success: true,
          message: `User with email ${email} is now an admin`
        });
      } catch (error) {
        console.error('Error making user admin:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to make user admin'
        });
      }
    });

    // Image upload endpoint
    app.post("/api/upload-image", upload.single('image'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'No image file provided'
          });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'plantopia',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        });

        // Clean up the temporary file
        const fs = require('fs');
        fs.unlinkSync(req.file.path);

        res.json({
          success: true,
          imageUrl: result.secure_url,
          publicId: result.public_id
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        
        // Clean up the temporary file if it exists
        if (req.file) {
          const fs = require('fs');
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error('Error deleting temp file:', unlinkError);
          }
        }

        res.status(500).json({
          success: false,
          message: 'Failed to upload image'
        });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is Hot now");
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});