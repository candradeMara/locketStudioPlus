const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/IndexPage.vue"),
        meta: { pageTitle: "Marathon Company" },
      },
      {
        path: "/copyrights",
        component: () => import("src/pages/PageSimple.vue"),
        props: true,
      },
      {
        path: "/page/:page",
        component: () => import("src/pages/PageSimple.vue"),
        props: true,
      },
      {
        path: "/register/",
        component: () => import("src/pages/Register.vue"),
        meta: { pageTitle: "Register" },
      },
      {
        path: "/contact/",
        component: () => import("src/pages/Contact.vue"),
        meta: { pageTitle: "Contact Us" },
      },
      {
        path: "/contact/:type",
        component: () => import("src/pages/Contact.vue"),
        props: true,
        meta: { pageTitle: "Contact Us" },
      },
    ],
  },

  // About Pages
  {
    path: "/about",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "ethics",
        component: () => import("pages/about/Ethics.vue"),
        meta: { pageTitle: "Our Ethics" },
      },
      {
        path: "tradeshows",
        component: () => import("pages/about/TradeShows.vue"),
        meta: { pageTitle: "Tradeshows" },
      },
      {
        path: ":page",
        component: () => import("src/pages/PageSimple.vue"),
        props: true,
      },
    ],
  },

  // ####### Restricted Pages (LoggedIn) ######### //
  // Products Pages
  {
    path: "/products",
    meta: {
      requiresAuth: false,
    },

    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "new",
        component: () => import("pages/shop/NewProducts.vue"),
        meta: { pageTitle: "New Products" },
      },
      {
        path: "",
        component: () => import("pages/shop/Products.vue"),
        name: "products",
        children: [
          {
            path: ":collection",
            component: () => import("pages/shop/Products.vue"),
          },
          {
            path: ":collection/:category",
            component: () => import("pages/shop/Products.vue"),
          },
        ],
      },
      {
        path: "search/:searchTerm",
        component: () => import("pages/shop/Products.vue"),
        name: "search",
      },
    ],
  },

  // Product Page
  {
    path: "/product",
    meta: {
      requiresAuth: false,
    },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: ":sku",
        component: () => import("src/pages/shop/ProductSingle.vue"),
        props: true,
        name: "product",
      },
    ],
  },
  // Store Pages
  {
    path: "/",
    meta: {
      requiresAuth: false,
    },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "cart",
        component: () => import("pages/shop/Cart.vue"),
        meta: { pageTitle: "Cart" },
      },
      {
        path: "checkout",
        component: () => import("pages/shop/Checkout.vue"),
        meta: { pageTitle: "Checkout" },
      },
    ],
  },

  // Account Pages
  {
    path: "/account",
    meta: {
      requiresAuth: true,
    },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/account/Dashboard.vue"),
        name: "account",
        meta: { pageTitle: "Account Dashboard" },
      },
      {
        path: "favorites",
        component: () => import("pages/account/Favorites.vue"),
        meta: { pageTitle: "Your Favorites" },
      },
      {
        path: "images",
        component: () => import("pages/account/ImageDownload.vue"),
        meta: { pageTitle: "Image Downloads" },
      },
      {
        path: "management",
        component: () => import("pages/account/Management.vue"),
        meta: { pageTitle: "User Management" },
      },
      {
        path: "order/:id",
        component: () => import("src/pages/account/OrderSingle.vue"),
      },
      {
        path: "orders",
        component: () => import("pages/account/Orders.vue"),
        meta: { pageTitle: "Orders" },
      },
      {
        path: "profile",
        component: () => import("src/pages/account/Profile.vue"),
        meta: { pageTitle: "Profile" },
      },
      {
        path: "reorder",
        component: () => import("pages/account/Ordered.vue"),
        meta: { pageTitle: "Reorder" },
      },
    ],
  },
  // Resource Pages
  {
    path: "/resources",
    meta: {
      requiresAuth: true,
    },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "testing",
        component: () => import("pages/resources/LeadTests.vue"),
        meta: { pageTitle: "Product Testing" },
      },
      {
        path: ":resourceType",
        component: () => import("pages/resources/ResourceType.vue"),
      },
    ],
  },

  // ####### Restricted Pages (Admin Only) ######### //
  // Shop Pages
  {
    path: "/admin",
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
    component: () => import("layouts/AdminLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/admin/Dashboard.vue"),
        meta: { pageTitle: "Admin Dashboard" },
      },
      {
        path: "newProducts",
        component: () => import("pages/admin/NewProducts.vue"),
        meta: { pageTitle: "New Products" },
      },
      {
        path: "tradeshows",
        component: () => import("pages/admin/Tradeshows.vue"),
        meta: { pageTitle: "Tradeshows" },
      },
      {
        path: "menu",
        component: () => import("pages/admin/Menu.vue"),
        meta: { pageTitle: "Menu" },
      },
      {
        path: "pages",
        component: () => import("pages/admin/Pages.vue"),
        meta: { pageTitle: "Pages" },
      },
      {
        path: "contact",
        component: () => import("pages/admin/Contact.vue"),
        meta: { pageTitle: "Contact" },
      },
      {
        path: "users",
        component: () => import("pages/admin/Users.vue"),
        meta: { pageTitle: "Users" },
      },
      {
        path: "newUsers",
        component: () => import("pages/admin/UsersNew.vue"),
        meta: { pageTitle: "UsersNew" },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
