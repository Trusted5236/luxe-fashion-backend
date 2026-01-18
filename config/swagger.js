import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Luxe Fashion API',
      version: '1.0.0',
      description: 'Complete API documentation for Luxe Fashion e-commerce platform',
      contact: {
        name: 'API Support',
        email: 'support@luxefashion.com'
      }
    },
    servers: [
      {
        url: 'https://luxe-fashion-backend-production.up.railway.app',
        description: 'Production server'
      },
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'seller', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            sellerName: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            price: { type: 'number' },
            stock: { type: 'number' },
            bonus: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            reviews: { 
              type: 'object',
              properties: {
                numberOfReviews: { type: 'number' },
                averageRating: { type: 'number' }
              }
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            image: { type: 'string' }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  quantity: { type: 'number' },
                  title: { type: 'string' },
                  price: { type: 'number' },
                  image: { type: 'string' }
                }
              }
            },
            totalCartProducts: { type: 'number' },
            totalPrice: { type: 'number' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            products: { type: 'array', items: { type: 'object' } },
            shippingAddress: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                country: { type: 'string' },
                zip: { type: 'string' }
              }
            },
            totalProduct: { type: 'number' },
            totalPrice: { type: 'number' },
            orderStatus: { type: 'string' },
            paymentId: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication and account management' },
      { name: 'OAuth', description: 'Social authentication' },
      { name: 'Products', description: 'Product management' },
      { name: 'Categories', description: 'Category management' },
      { name: 'Cart', description: 'Shopping cart operations' },
      { name: 'Orders', description: 'Order management and payment' },
      { name: 'Admin', description: 'Admin dashboard and statistics (Admin only)' }
    ],
    paths: {
      '/api/auth': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          description: 'Create a new user account with name, email, and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', minLength: 3, example: 'John Doe' },
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', minLength: 6, example: 'password123' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: { type: 'string', description: 'JWT token' }
                }
              }
            },
            400: { description: 'Validation error or user already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
          description: 'Authenticate user and receive JWT token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', example: 'password123' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: { type: 'string', description: 'JWT token' }
                }
              }
            },
            400: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/auth/profile': {
        get: {
          tags: ['Authentication'],
          summary: 'Get user profile',
          description: 'Retrieve authenticated user profile information',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'User profile retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/auth/request-password-reset': {
        post: {
          tags: ['Authentication'],
          summary: 'Request password reset',
          description: 'Send password reset email to user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'john@example.com' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Reset email sent successfully' },
            400: { description: 'Email not registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/auth/reset-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Reset password',
          description: 'Reset user password using reset token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['resetToken', 'newPassword'],
                  properties: {
                    resetToken: { type: 'string' },
                    newPassword: { type: 'string', minLength: 6 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Password reset successfully' },
            400: { description: 'Invalid token or same password', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/authentication/google': {
        get: {
          tags: ['OAuth'],
          summary: 'Google OAuth login',
          description: 'Initiate Google OAuth authentication flow',
          responses: {
            302: { description: 'Redirect to Google login' }
          }
        }
      },
      '/api/authentication/google/callback': {
        get: {
          tags: ['OAuth'],
          summary: 'Google OAuth callback',
          description: 'Handle Google OAuth callback and redirect with token',
          responses: {
            302: { description: 'Redirect to frontend with JWT token' }
          }
        }
      },
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'Get all products',
          description: 'Retrieve paginated list of products with optional filtering',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
            { name: 'perPage', in: 'query', schema: { type: 'integer', default: 8 }, description: 'Products per page' },
            { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category name' },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by product title' }
          ],
          responses: {
            200: {
              description: 'Products retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                      page: { type: 'number' },
                      perPage: { type: 'number' },
                      totalPages: { type: 'number' },
                      totalProducts: { type: 'number' },
                      totalProductInDB: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Products'],
          summary: 'Create a product',
          description: 'Create a new product (Seller only)',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['sellerName', 'title', 'description', 'category', 'price', 'stock'],
                  properties: {
                    sellerName: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    category: { type: 'string' },
                    price: { type: 'number' },
                    stock: { type: 'number' },
                    bonus: { type: 'string' },
                    images: { type: 'array', items: { type: 'string', format: 'binary' }, maxItems: 8 }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Product created successfully' },
            400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Seller role required' }
          }
        }
      },
      '/api/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by ID',
          description: 'Retrieve detailed information about a specific product',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ID' }
          ],
          responses: {
            200: {
              description: 'Product retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      product: { $ref: '#/components/schemas/Product' }
                    }
                  }
                }
              }
            },
            404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/categories': {
        get: {
          tags: ['Categories'],
          summary: 'Get all categories',
          description: 'Retrieve list of all product categories',
          responses: {
            200: {
              description: 'Categories retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Category' }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Categories'],
          summary: 'Create a category',
          description: 'Create a new product category (Admin only)',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['name', 'image'],
                  properties: {
                    name: { type: 'string' },
                    image: { type: 'string', format: 'binary' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Category created successfully' },
            400: { description: 'Missing fields or category exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Admin role required' }
          }
        }
      },
      '/api/categories/{id}': {
        delete: {
          tags: ['Categories'],
          summary: 'Delete a category',
          description: 'Delete a category by ID (Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Category ID' }
          ],
          responses: {
            200: { description: 'Category deleted successfully' },
            404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Admin role required' }
          }
        },
        patch: {
          tags: ['Categories'],
          summary: 'Update a category',
          description: 'Update category name or image (Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Category ID' }
          ],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    image: { type: 'string', format: 'binary' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Category updated successfully' },
            404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Admin role required' }
          }
        }
      },
      '/api/cart/{productId}': {
        post: {
          tags: ['Cart'],
          summary: 'Add product to cart',
          description: 'Add a product to user cart or update quantity if already exists',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'productId', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ID' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['quantity'],
                  properties: {
                    quantity: { type: 'number', minimum: 1, example: 1 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Product added to cart successfully' },
            404: { description: 'Product not found or insufficient stock', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/cart': {
        get: {
          tags: ['Cart'],
          summary: 'Get user cart',
          description: 'Retrieve current user shopping cart',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Cart retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Cart' }
                }
              }
            },
            404: { description: 'Cart not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/cart/increase/{productId}': {
        patch: {
          tags: ['Cart'],
          summary: 'Increase product quantity',
          description: 'Increase quantity of a product in cart',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'productId', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ID' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['quantity'],
                  properties: {
                    quantity: { type: 'number', minimum: 1, example: 1 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Product quantity increased successfully' },
            404: { description: 'Product or cart not found, or insufficient stock', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/cart/decrease/{productId}': {
        patch: {
          tags: ['Cart'],
          summary: 'Decrease product quantity',
          description: 'Decrease quantity of a product in cart (removes if quantity becomes 0)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'productId', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ID' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['quantity'],
                  properties: {
                    quantity: { type: 'number', minimum: 1, example: 1 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Product quantity decreased successfully' },
            404: { description: 'Product or cart not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/cart/delete/{productId}': {
        patch: {
          tags: ['Cart'],
          summary: 'Remove product from cart',
          description: 'Remove a specific product from cart',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'productId', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ID' }
          ],
          responses: {
            200: { description: 'Product removed from cart successfully' },
            404: { description: 'Product or cart not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/order/create': {
        post: {
          tags: ['Orders'],
          summary: 'Create an order',
          description: 'Create a new order from cart items',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'country', 'zip'],
                  properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    address: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    country: { type: 'string' },
                    zip: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Order created successfully, awaiting payment' },
            400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Cart not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/order/paypal/create-order': {
        post: {
          tags: ['Orders'],
          summary: 'Create PayPal order',
          description: 'Initialize PayPal payment for an order',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['orderId'],
                  properties: {
                    orderId: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'PayPal order created successfully' },
            400: { description: 'Order ID required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Order not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/order/paypal/capture-order': {
        post: {
          tags: ['Orders'],
          summary: 'Capture PayPal payment',
          description: 'Complete PayPal payment and update order status',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['paypalOrderId', 'orderId'],
                  properties: {
                    paypalOrderId: { type: 'string' },
                    orderId: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Payment successful' },
            400: { description: 'Missing IDs or payment failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Order not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/order': {
        get: {
          tags: ['Orders'],
          summary: 'Get user orders',
          description: 'Retrieve all orders for authenticated user',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Orders retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      order: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Order' }
                      }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/order/{id}': {
        delete: {
          tags: ['Orders'],
          summary: 'Delete an order',
          description: 'Delete an order and associated images',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Order ID' }
          ],
          responses: {
            200: { description: 'Order deleted successfully' },
            404: { description: 'Order not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            500: { description: 'Error deleting order', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/admin/stats': {
        get: {
          tags: ['Admin'],
          summary: 'Get admin statistics',
          description: 'Retrieve comprehensive platform statistics including users, sellers, products, and revenue (Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Items per page' }
          ],
          responses: {
            200: {
              description: 'Statistics retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      users: {
                        type: 'object',
                        properties: {
                          total: { type: 'number' },
                          newThisMonth: { type: 'number' },
                          list: { type: 'array', items: { $ref: '#/components/schemas/User' } }
                        }
                      },
                      sellers: {
                        type: 'object',
                        properties: {
                          total: { type: 'number' },
                          newThisMonth: { type: 'number' },
                          list: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                          products: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
                        }
                      },
                      admins: {
                        type: 'object',
                        properties: {
                          total: { type: 'number' },
                          list: { type: 'array', items: { $ref: '#/components/schemas/User' } }
                        }
                      },
                      products: {
                        type: 'object',
                        properties: {
                          total: { type: 'number' },
                          list: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
                        }
                      },
                      revenue: { type: 'number' },
                      pagination: { type: 'object' }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Admin role required' }
          }
        }
      }
    }
  },
  apis: [] // Required by swagger-jsdoc but not used since we defined paths directly
};

const specs = swaggerJSDoc(options);

export default specs;