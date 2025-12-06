import { onRequestDelete as __api_admin_products__id__ts_onRequestDelete } from "D:\\ModernizedVisions\\chesapeakeshell\\chesapeakeshell-demo1\\project\\functions\\api\\admin\\products\\[id].ts"
import { onRequestPut as __api_admin_products__id__ts_onRequestPut } from "D:\\ModernizedVisions\\chesapeakeshell\\chesapeakeshell-demo1\\project\\functions\\api\\admin\\products\\[id].ts"
import { onRequestGet as __api_admin_products_ts_onRequestGet } from "D:\\ModernizedVisions\\chesapeakeshell\\chesapeakeshell-demo1\\project\\functions\\api\\admin\\products.ts"
import { onRequestPost as __api_admin_products_ts_onRequestPost } from "D:\\ModernizedVisions\\chesapeakeshell\\chesapeakeshell-demo1\\project\\functions\\api\\admin\\products.ts"
import { onRequestPost as __api_admin_upload_image_ts_onRequestPost } from "D:\\ModernizedVisions\\chesapeakeshell\\chesapeakeshell-demo1\\project\\functions\\api\\admin\\upload-image.ts"
import { onRequest as __api_admin_products_ts_onRequest } from "D:\\ModernizedVisions\\chesapeakeshell\\chesapeakeshell-demo1\\project\\functions\\api\\admin\\products.ts"
import { onRequest as __api_admin_upload_image_ts_onRequest } from "D:\\ModernizedVisions\\chesapeakeshell\\chesapeakeshell-demo1\\project\\functions\\api\\admin\\upload-image.ts"
import { onRequestGet as __api_products__id__ts_onRequestGet } from "D:\\ModernizedVisions\\chesapeakeshell\\chesapeakeshell-demo1\\project\\functions\\api\\products\\[id].ts"
import { onRequestGet as __api_products_ts_onRequestGet } from "D:\\ModernizedVisions\\chesapeakeshell\\chesapeakeshell-demo1\\project\\functions\\api\\products.ts"

export const routes = [
    {
      routePath: "/api/admin/products/:id",
      mountPath: "/api/admin/products",
      method: "DELETE",
      middlewares: [],
      modules: [__api_admin_products__id__ts_onRequestDelete],
    },
  {
      routePath: "/api/admin/products/:id",
      mountPath: "/api/admin/products",
      method: "PUT",
      middlewares: [],
      modules: [__api_admin_products__id__ts_onRequestPut],
    },
  {
      routePath: "/api/admin/products",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_products_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/products",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_products_ts_onRequestPost],
    },
  {
      routePath: "/api/admin/upload-image",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_upload_image_ts_onRequestPost],
    },
  {
      routePath: "/api/admin/products",
      mountPath: "/api/admin",
      method: "",
      middlewares: [],
      modules: [__api_admin_products_ts_onRequest],
    },
  {
      routePath: "/api/admin/upload-image",
      mountPath: "/api/admin",
      method: "",
      middlewares: [],
      modules: [__api_admin_upload_image_ts_onRequest],
    },
  {
      routePath: "/api/products/:id",
      mountPath: "/api/products",
      method: "GET",
      middlewares: [],
      modules: [__api_products__id__ts_onRequestGet],
    },
  {
      routePath: "/api/products",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_products_ts_onRequestGet],
    },
  ]