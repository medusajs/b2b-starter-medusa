# Architectural Blueprint for Advanced Product Catalog Management in Medusa.js: Bundles, Components, and Custom Data

## Section 1: Architectural Foundations for Product Extensibility in Medusa.js

Medusa.js is engineered as a headless, composable commerce platform, a design choice that fundamentally enables the development of sophisticated and custom e-commerce applications. This architectural paradigm decouples the backend, which contains the core commerce logic, from the frontend presentation layer. This separation is the primary enabler for creating unique user experiences, a critical requirement for managing non-standard product types like kits and bundles. The platform is structured around three core components: the Medusa Server, the Admin Dashboard, and one or more Storefronts. All business logic and data model customizations are implemented within the server, with corresponding extensions subsequently developed for the Admin and Storefront to manage and display these new capabilities.  

The flow of data within a Medusa application follows a well-defined, layered architecture, providing a clear structure for requests. A typical request, such as adding an item to a cart, traverses four distinct layers:

1. **API Routes (HTTP):** This is the entry point for all external clients. The server, built on Express.js, handles incoming HTTP requests from storefronts, admin panels, or other systems.  
    

- **Workflows:** API routes invoke workflows, which encapsulate the high-level business logic of a given operation. Workflows are sequences of steps designed to ensure data consistency across the system, complete with error handling and rollback mechanisms.  
    

- **Modules:** Workflows utilize domain-specific modules for resource management and interaction with data. These modules contain the services and data models related to a specific commerce domain, like Products or Orders.  
    

- **Data Store:** Modules interact with the underlying data store, which is typically a PostgreSQL database, to perform read and write operations.  
    

This layered structure deliberately enforces a separation of concerns. While this may require more initial setup compared to monolithic systems—demanding the explicit definition of modules, workflows, and their interconnections—it yields a significantly more maintainable, scalable, and upgrade-resistant application over time. The architecture itself acts as a guardrail, preventing common anti-patterns such as embedding business logic directly within API endpoints, thus ensuring long-term architectural integrity.

To facilitate deep customization, Medusa provides several key extensibility mechanisms. It is crucial to distinguish between **Modules** and **Plugins**. A Module is an isolated package of code related to a single domain, such as a custom "Bundle" module. In contrast, a Plugin is a reusable package that can contain a variety of customizations, including modules, API routes, and admin extensions, making it ideal for distributing a complete feature set. For creating relationships between data models in different, isolated modules, Medusa employs **Data Model Links**. This is the sanctioned architectural pattern for connecting a custom entity, like a `Bundle`, to a core entity, such as a `Product`, without modifying the core codebase. This preserves the integrity of the core system while allowing for infinite extensibility.  

## Section 2: The "Mega Prompt" for Component Products

To establish a robust standard for managing "components," it is essential to map this concept directly onto Medusa's core product data model. This approach leverages the platform's native capabilities for inventory, pricing, and organization, providing a solid foundation upon which more complex structures like bundles can be built.

### Data Model Mapping

The standard for a "component" is defined by a triad of core Medusa entities: `Product`, `ProductVariant`, and `ProductOption`.

- **The `Product` Entity as the Component Template:** The `Product` entity serves as the primary container, or template, for a component. It holds the descriptive and organizational data that is common across all variations of that component. Key properties include `title`, `handle` (for URL generation), `description`, `status`, and organizational attributes like `tags`, `categories`, and `collection`. For example, a `Product` could represent "M5 Hex Bolt."  
    

- **The `ProductVariant` Entity as the Sellable Unit:** The `ProductVariant` is the actual, physical item that is sold and tracked. It represents a specific configuration of the parent `Product` and holds all commercial and logistical information. Crucial properties include its own `title`, a unique `sku`, `inventory_quantity`, and the `manage_inventory` flag. Pricing is managed through its relationship with the `MoneyAmount` entity, allowing for different prices per currency or region. Continuing the example, "M5x20mm Steel Hex Bolt" and "M5x25mm Titanium Hex Bolt" would be two distinct `ProductVariant` records under the single "M5 Hex Bolt" `Product`.  
    

- **The `ProductOption` Entity for Configuration:** `ProductOption` entities define the attributes that differentiate variants, such as "Length" or "Material". The combination of values from these options generates the matrix of possible `ProductVariant` combinations.  
    

This structured separation between the conceptual product and the sellable variant is a powerful abstraction. It prevents catalog bloat by grouping logical components under a single product record, which is essential for managing large and complex catalogs, as seen in case studies involving tens of thousands of products. Furthermore, this model aligns perfectly with external systems like Enterprise Resource Planning (ERP) software, which typically track inventory at the SKU level, corresponding directly to Medusa's `ProductVariant`. Establishing this standard is therefore critical for future system integrations.  

### API Interaction Schema

To create a new component programmatically, a request is sent to the Admin API endpoint `POST /admin/products`. The JSON payload must be structured to define the product shell, its options, and the resulting variants.

**Example Payload for Component Creation:**

JSON

```
{
  "title": "M5 Hex Bolt",
  "subtitle": "High-tensile strength hex bolts",
  "is_giftcard": false,
  "discountable": true,
  "options": [
    { "title": "Length" },
    { "title": "Material" }
  ],
  "variants":,
      "prices": [
        { "currency_code": "usd", "amount": 50 },
        { "currency_code": "eur", "amount": 45 }
      ]
    },
    {
      "title": "25mm Titanium",
      "sku": "HB-M5-25-TI",
      "ean": "0123456789124",
      "inventory_quantity": 500,
      "manage_inventory": true,
      "options":,
      "prices": [
        { "currency_code": "usd", "amount": 250 },
        { "currency_code": "eur", "amount": 230 }
      ]
    }
  ]
}
```

Note: The order of option values in the variant's `options` array must match the order of `options` defined at the product level.  

For frontend consumption, component data can be retrieved via the Store API endpoint `GET /store/products` or by using the `medusa-react` library, which provides convenient hooks like `useAdminVariants` for admin interfaces and similar hooks for storefronts.  

## Section 3: A Strategic Analysis of Product Bundle Implementations

Medusa.js offers multiple pathways to implement "kits as bundles." The selection of an approach is not merely a technical choice but a strategic business decision that reflects the required complexity, time-to-market constraints, and long-term vision for the product catalog.

### 3.1. The Native Approach: Inventory Kits

The quickest method to create bundles is by using Medusa's native Inventory Kits feature. This approach involves creating a standard product variant and enabling the `has_inventory_kit` flag. The inventory of this "bundle" variant is then composed of specified quantities of other existing `InventoryItem` records. This is ideal for simple, pre-defined kits where all components are fulfilled together from a single location and the bundle's price can be set manually on the variant. However, this approach has significant and explicitly documented limitations: it does not support dynamic pricing based on the components' prices, nor does it allow for the separate fulfillment of individual items within the bundle. Choosing this path effectively creates a technical dead-end if more advanced functionality is required later.  

### 3.2. The Custom Architecture Approach: Dedicated Bundle Module

For maximum flexibility, the recommended approach is to build a dedicated `Bundle` module. This involves creating custom data models (e.g., `Bundle` and `BundleItem`), establishing a formal relationship to the core `Product` module using Data Model Links, and developing custom workflows and API routes to manage the entire lifecycle of a bundle. This architectural investment is necessary for complex use cases that require dynamic pricing (e.g., "10% off the total price of bundled items"), separate fulfillment of components, or custom bundle-specific attributes. While it requires the most significant upfront development effort, this method provides a robust and scalable platform for future innovation, aligning perfectly with Medusa's philosophy of enabling businesses to own their core commerce logic.  

### 3.3. The Turnkey Plugin Approach: `@agilo/medusa-plugin-bundles`

A third option is to leverage a community-developed plugin like `@agilo/medusa-plugin-bundles`. Such plugins provide a pre-packaged solution that typically includes its own data models, a dedicated user interface within the Medusa Admin, and custom API endpoints (e.g., `/store/bundles`) for storefront integration. This approach can dramatically accelerate development time and is a strong choice for teams that find the plugin's feature set aligns with their requirements. However, it introduces a dependency on a third-party package, ceding control over the feature's evolution and creating a potential risk related to long-term maintenance and support. It represents a strategic partnership that trades some control for speed.  

### 3.4. Strategic Recommendation Framework

The decision between these three strategies should be guided by a clear understanding of business requirements and strategic goals. A startup focused on rapid market entry might opt for the plugin to validate its offering, whereas an established enterprise with complex fulfillment logic would require the custom module approach to meet its specific needs. The following table distills these trade-offs to aid in the decision-making process.

**Table 1: Comparison of Product Bundle Implementation Strategies**

|Feature / Criterion|**Native Inventory Kits**|**Custom Bundle Module**|**`@agilo/medusa-plugin-bundles`**|
|---|---|---|---|
|**Custom Bundle Pricing**|Limited (Manual price on variant)|Fully Flexible (Dynamic logic in workflows)|As per plugin features|
|**Separate Item Fulfillment**|Not Supported|Fully Supported (Custom order/fulfillment logic)|As per plugin features|
|**Admin UI Integration**|Native (Within variant management)|Requires Custom Development (UI Routes/Widgets)|Provided by Plugin|
|**Development Effort**|Low|High|Low-to-Medium (Integration)|
|**Maintainability**|High (Core feature)|Medium (Owned code)|Low (Dependent on plugin author)|
|**Time to Market**|Fastest|Slowest|Fast|
|**Architectural Flexibility**|Very Low|Very High|Medium (Limited to plugin's design)|
|**Recommendation**|Simple, pre-defined kits with no special pricing or fulfillment needs.|Complex use cases requiring unique business logic, pricing rules, and fulfillment flows.|Projects needing a robust bundle solution quickly, willing to accept a third-party dependency.|

## Section 4: The "Mega Prompt" for a Custom Bundle Architecture

This section provides the technical blueprint for implementing the custom bundle module, the most robust and flexible of the analyzed strategies.

### 4.1. Data Model Definitions (DML)

The foundation of the custom module is its data models, defined using Medusa's Data Model Language (DML).  

- **`src/modules/bundle/models/bundle.ts`:** This file defines the primary `Bundle` entity.
    
    TypeScript
    

- ```
    import { model } from "@medusajs/framework/utils"
    import { BundleItem } from "./bundle-item"
    
    export const Bundle = model.define("bundle", {
      id: model.id().primaryKey(),
      title: model.text(),
      items: model.hasMany(() => BundleItem, {
        mappedBy: "bundle",
      }),
    })
    ```
    
- **`src/modules/bundle/models/bundle_item.ts`:** This file defines the `BundleItem` entity, which represents a component within a bundle.
    
    TypeScript
    
- ```
    import { model } from "@medusajs/framework/utils"
    import { Bundle } from "./bundle"
    
    export const BundleItem = model.define("bundle_item", {
      id: model.id().primaryKey(),
      quantity: model.number().default(1),
      bundle: model.belongsTo(() => Bundle, {
        mappedBy: "items",
      }),
    })
    ```
    
- **`src/links/bundle-product.ts`:** This crucial file establishes the relationship between the custom `BundleItem` and the core `Product` entity, allowing a bundle to contain components.
    
    TypeScript
    

- ```
    import { defineLink } from "@medusajs/framework/utils"
    import BundleModule from "../modules/bundle"
    import ProductModule from "@medusajs/medusa/product"
    
    export default defineLink(
      BundleModule.linkable.bundle_item,
      ProductModule.linkable.product
    )
    ```
    

### 4.2. Core Workflows and Service Logic

With the data models defined, the next step is to implement the business logic.

- **Service Definition:** A service class is created to manage the new entities. By extending `MedusaService`, it automatically inherits CRUD (Create, Read, Update, Delete) methods for the `Bundle` and `BundleItem` models.  
    

TypeScript

- ```
    // src/modules/bundle/service.ts
    import { MedusaService } from "@medusajs/framework/utils"
    import { Bundle } from "./models/bundle"
    import { BundleItem } from "./models/bundle-item"
    
    export default class BundledProductModuleService extends MedusaService({
      Bundle,
      BundleItem,
    }) { }
    ```
    
- **Workflow Outline: `createBundleWorkflow`:** This workflow orchestrates the creation of a complete bundle.
    
    1. **Input:** The workflow accepts an object containing `title` for the bundle and an `items` array, where each element is an object with `product_id` and `quantity`.
        
    2. **Step 1 (Create Product Shell):** Use the existing `createProductsWorkflow` from Medusa's core flows to create a new `Product` record. This record will represent the bundle itself in the main product catalog, making it discoverable and manageable alongside standard products.
        
    3. **Step 2 (Create Bundle Record):** Use the custom `BundledProductModuleService` to create the `Bundle` record with the provided title.
        
    4. **Step 3 (Create Bundle Items):** Iterate through the input `items` array and use the service to create a `BundleItem` record for each component.
        
    5. **Step 4 (Link Records):** Utilize the `createRemoteLinkStep` to establish the necessary relationships. First, link the `Bundle` record from Step 2 to the `Product` shell from Step 1. Then, link each `BundleItem` from Step 3 to its corresponding component `Product` using the provided `product_id`.  
        

### 4.3. API Schemas and Endpoint Definitions

Finally, API endpoints are created to expose this functionality.

- **Admin API (`/admin/bundles`):**
    
    - `POST /admin/bundles`: The request body for this endpoint should mirror the input schema of the `createBundleWorkflow`. It will trigger the workflow to create a new bundle.
        
    - `GET /admin/bundles`: This endpoint will list all created bundles. The response should be structured to include the bundle's details along with its associated items and their linked product information, retrieved using Medusa's `Query` functionality.  
        

- **Store API (`/store/bundles`):**
    
    - `GET /store/bundles/:id`: This endpoint provides the public-facing data for a specific bundle. The response must include all necessary details for rendering on a product detail page, including the bundle's title, description, and a comprehensive list of its component products with their titles, images, and prices.
        

## Section 5: Integrating Technical Sheets and Managing Product Imagery

This section provides definitive standards for handling technical sheet URLs and product images, addressing the user's specific requirements with a focus on scalability and best practices.

### 5.1. Implementing Technical Sheet URLs: A Comparative Analysis

There are two primary methods for associating a technical sheet URL with a product.

- **Option 1: The `metadata` Property (Simple Approach):** Every core Medusa entity, including `Product` and `ProductVariant`, features a `metadata` property, which is a JSONB database field designed to store arbitrary key-value pairs. Adding a `technical_sheet_url` key to this object is straightforward and requires no database schema modifications.  
    

- **Option 2: The Linked Custom Entity (Robust Approach):** The architecturally superior method is to create a new, dedicated `TechnicalSheet` module. This module would have its own data model with fields like `id`, `url`, `file_type`, `version`, etc. This new entity is then linked to the core `Product` entity using the `defineLink` function, following the same robust pattern used for the custom bundle module.  
    

The definitive recommendation is **Option 2**. The user's request emphasizes establishing "standards" (`padrões`), and the `metadata` field is inherently standard-less. While tempting for its simplicity, it quickly becomes an unmanageable "junk drawer" at scale, offering no validation or structure. A custom `TechnicalSheet` entity, by contrast, provides a structured, queryable, and future-proof solution. It allows for future enhancements, such as version history or multi-language support for sheets, without requiring further schema changes. This approach solves not only today's requirement to store a URL but also anticipates the unknown requirements of tomorrow, which is the hallmark of sound architecture.

### 5.2. Comprehensive Image Management Protocol

Effective image management in Medusa relies on a clear understanding of its architecture, which separates file handling from data association.

- **Prerequisite: The File Service:** It is critical to understand that Medusa's core does not handle file storage. A **File Service plugin** must be installed and configured as a non-negotiable first step. This plugin acts as a driver, instructing Medusa on how to upload files to a chosen storage provider, such as AWS S3 (`medusa-file-s3`) or DigitalOcean Spaces (`medusa-file-spaces`). For development, a local file service provider is available.  
    

- **Data Model: `ProductImage`:** The `ProductImage` entity is a simple data model that stores the `url` of an image after it has been uploaded by the configured File Service. It maintains a `belongsTo` relationship with a `Product`, effectively associating the image URL with the correct product record.  
    

- **Programmatic Upload Workflow:** The process of programmatically adding an image to a product involves a multi-step API interaction:
    
    1. The client application sends the raw file data to the Medusa server via the `POST /admin/uploads` endpoint.  
        
- 2. The server delegates the file to the configured File Service.
        
    3. The File Service uploads the file to the external storage provider (e.g., an S3 bucket).
        
    4. The provider returns a secure, publicly accessible URL for the uploaded file.
        
    5. The File Service passes this URL back to the server, which returns it to the client.
        
    6. The client then makes a second API call to update the product (e.g., `POST /admin/products/:id`), including the newly acquired image URL(s) in the `images` array of the request payload. Medusa then creates the corresponding `ProductImage` records in the database and links them to the specified product.
        
- **Admin Panel and Thumbnail Management:** In the Medusa Admin dashboard, this complex, multi-step process is abstracted away from the user. An administrator simply uploads an image through the UI, which handles the sequence of API calls in the background. The `Product` entity itself has a `thumbnail` property, which is a text field that stores the URL of one of its associated `ProductImage` records. Setting an image as the thumbnail is an operation that updates this specific field with the desired URL.  
    

## Section 6: Conclusion and Implementation Roadmap

This report has outlined a comprehensive architectural blueprint for extending Medusa.js to support a complex product catalog featuring components, bundles, and custom data like technical sheets. By adhering to these standards, a development team can build a scalable, maintainable, and highly flexible commerce solution.

### Summary of Standards

- **Components:** Individual sellable parts should be modeled using Medusa's core `Product` and `ProductVariant` entities. The `Product` serves as the template, while the `ProductVariant` represents the specific, inventory-tracked SKU.
    
- **Bundles:** For maximum flexibility in pricing and fulfillment, "kits" should be implemented as a dedicated `Bundle` module with its own data models (`Bundle`, `BundleItem`) and business logic encapsulated in custom workflows.
    
- **Technical Sheets:** To ensure data integrity and future extensibility, technical sheet URLs and related metadata should be stored in a dedicated `TechnicalSheet` module and linked to the `Product` entity.
    
- **Images:** A production-grade File Service plugin (e.g., for AWS S3) must be configured as a prerequisite for all image management. Images are associated with products via the `ProductImage` entity, which stores the URL returned by the File Service.
    

### Phased Implementation Roadmap

A phased approach is recommended to manage complexity and deliver value incrementally.

- **Phase 1: Foundation Setup**
    
    1. Deploy a standard Medusa backend with a PostgreSQL database and Redis.
        
    2. Select, install, and configure the chosen production File Service plugin.
        
    3. Begin populating the catalog with "component" products, strictly adhering to the Product/Variant data model standard.
        
- **Phase 2: Custom Data Extension**
    
    1. Develop the `TechnicalSheet` custom module, including its data model, service, and the link definition to the core `Product` module.
        
    2. Generate and run the necessary database migrations.
        
    3. Extend the Medusa Admin with a custom widget on the product detail page to allow for the management of associated technical sheets.
        
- **Phase 3: Bundle Implementation**
    
    1. Develop the full `Bundle` custom module, including its data models (`Bundle`, `BundleItem`), service, and link definitions.
        
    2. Implement the core workflows (e.g., `createBundleWorkflow`) and the corresponding Admin API endpoints.
        
    3. Extend the Medusa Admin by creating a new UI Route (a new page) dedicated to creating, viewing, and managing bundles.
        
- **Phase 4: Storefront Integration**
    
    1. Develop the frontend components required to display bundles and their constituent components on the storefront.
        
    2. Implement logic to display links to technical sheets on product pages.
        
    3. Integrate the "add to cart" functionality for bundles, ensuring that all component items are correctly added to the cart via the appropriate Store API calls.
        

[

![](https://t0.gstatic.com/faviconV2?url=https://medium.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medium.com

Exploring Medusa's Composable Architecture | by Ekisoweidaniel - Medium

Abre em uma nova janela](https://medium.com/@ekisoweidaniel/exploring-medusas-composable-architecture-59ef3f42c46b)[

![](https://t2.gstatic.com/faviconV2?url=https://www.rigbyjs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

rigbyjs.com

A Closer Look at Medusa.js: Features Overview | Rigby Blog

Abre em uma nova janela](https://www.rigbyjs.com/blog/medusajs-features-overview)[

![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Beginner Guide to a Node.js Ecommerce: Understanding Medusa's Server

Abre em uma nova janela](https://medusajs.com/blog/beginner-guide-to-node-js-ecommerce-platform-understanding-the-medusa-server/)[

![](https://t2.gstatic.com/faviconV2?url=https://www.linearloop.io/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

linearloop.io

Why MedusaJS is the Future of Headless Ecommerce - Linearloop

Abre em uma nova janela](https://www.linearloop.io/blog/medusa-js-headless-ecommerce-guide)[

![](https://t3.gstatic.com/faviconV2?url=https://www.freecodecamp.org/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

freecodecamp.org

Component-Based Architecture in Medusa – How to Build Robust User Interfaces

Abre em uma nova janela](https://www.freecodecamp.org/news/exploring-component-based-architecture-in-medusa-building-robust-user-interfaces/)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

1.3. Medusa's Architecture - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/learn/introduction/architecture)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

3.3. Modules - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/learn/fundamentals/modules)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

3.10. Plugins - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/learn/fundamentals/plugins)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Plugins - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/v1/development/plugins/overview)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Extend Product Data Model - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/resources/commerce-modules/product/extend)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Product Module Data Models Reference - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/resources/references/product/models/Product)[

![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Product Module - Medusa

Abre em uma nova janela](https://medusajs.com/product-module/)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Manage Product Variants in Medusa Admin - Medusa Admin User ...

Abre em uma nova janela](https://docs.medusajs.com/user-guide/products/variants)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

ProductVariant - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/v1/references/entities/classes/ProductVariant)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Products Architecture Overview - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/v1/modules/products)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

ProductOption - Product Module Data Models Reference - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/resources/references/product/models/ProductOption)[

![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Catalog: Building a B2B Platform for SMBs with Medusa

Abre em uma nova janela](https://medusajs.com/blog/catalog/)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

ProductVariantReq - Medusa Docs

Abre em uma nova janela](https://docs.medusajs.com/v1/references/medusa/classes/medusa.ProductVariantReq)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Product Variants - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/v1/references/medusa-react/hooks/admin/product_variants)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Select Product Variants in Storefront - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/resources/storefront-development/products/variants)[

![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

V2 Overview - Medusa

Abre em uma nova janela](https://medusajs.com/v2-overview/)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Bundled Products Recipe - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/resources/recipes/bundled-products)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Inventory Kits - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/resources/commerce-modules/inventory/inventory-kit)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Implement Bundled Products in Medusa

Abre em uma nova janela](https://docs.medusajs.com/resources/recipes/bundled-products/examples/standard)[

![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

Agilo/medusa-plugin-bundles: Group products together in product bundles. - GitHub

Abre em uma nova janela](https://github.com/Agilo/medusa-plugin-bundles)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

3.5. Data Models - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/learn/fundamentals/data-models)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Digital Products Recipe Example - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/resources/recipes/digital-products/examples/standard)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Personalized Products - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/v1/recipes/personalized-products)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Extend Customer Data Model - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/resources/commerce-modules/customer/extend)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Spaces - Medusa Docs

Abre em uma nova janela](https://docs.medusajs.com/v1/plugins/file-service/spaces)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

S3 - Medusa Docs

Abre em uma nova janela](https://docs.medusajs.com/v1/plugins/file-service/s3)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

File Module - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/resources/infrastructure-modules/file)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

ProductImage - Product Module Data Models Reference - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/resources/references/product/models/ProductImage)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

upload - JS SDK Admin Reference - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/resources/references/js-sdk/admin/upload)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Create Product in Medusa Admin - Medusa Admin User Guide

Abre em uma nova janela](https://docs.medusajs.com/user-guide/products/create)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Edit Product in Medusa Admin - Medusa Admin User Guide - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/user-guide/products/edit)

[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/v1/)[

![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

medusajs/medusa: The world's most flexible commerce platform. - GitHub

Abre em uma nova janela](https://github.com/medusajs/medusa)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Welcome to Medusa's User Guide

Abre em uma nova janela](https://docs.medusajs.com/v1/user-guide)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

3.5.2. Data Model Properties - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/learn/fundamentals/data-models/properties)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Medusa Data Model Language Reference

Abre em uma nova janela](https://docs.medusajs.com/resources/references/data-model)[

![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

Releases · medusajs/medusa - GitHub

Abre em uma nova janela](https://github.com/medusajs/medusa/releases)[

![](https://t3.gstatic.com/faviconV2?url=https://kvytechnology.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

kvytechnology.com

Streamlining Product Management with Medusa.js: Tips and Tricks - KVY TECH

Abre em uma nova janela](https://kvytechnology.com/blog/software/product-management-with-medusa-js/)[

![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Implement Bundled Products in Medusa

Abre em uma nova janela](https://medusajs.com/blog/bundled-products/)[

![](https://t0.gstatic.com/faviconV2?url=https://medium.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medium.com

Building a multivendor marketplace with Medusa.js 2.0: a Dev guide (Part 1) - Medium

Abre em uma nova janela](https://medium.com/@igorkhomenko/building-a-multivendor-marketplace-with-medusa-js-2-0-a-dev-guide-f55aec971126)[

![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Inventory Module - Medusa

Abre em uma nova janela](https://medusajs.com/inventory-module/)[

![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

[Bug]: "medusa build" does not bundle plugin admin widgets · Issue #11656 - GitHub

Abre em uma nova janela](https://github.com/medusajs/medusa/issues/11656)[

![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Integrate your commerce stack with your favorite tools - Medusa.js

Abre em uma nova janela](https://medusajs.com/integrations/)[

![](https://t1.gstatic.com/faviconV2?url=https://community.weweb.io/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

community.weweb.io

Using Medusa.js and NPM plugin to build out an e-commerce backend - Optimal Solution?

Abre em uma nova janela](https://community.weweb.io/t/using-medusa-js-and-npm-plugin-to-build-out-an-e-commerce-backend-optimal-solution/7439)[

![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

[docs] Add article/tutorial that outlines custom attribute addition to product entity including UI · medusajs medusa · Discussion #5133 - GitHub

Abre em uma nova janela](https://github.com/medusajs/medusa/discussions/5133)[

![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

Custom Fields API · medusajs medusa · Discussion #1947 - GitHub

Abre em uma nova janela](https://github.com/medusajs/medusa/discussions/1947)[

![](https://t0.gstatic.com/faviconV2?url=https://stackoverflow.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

stackoverflow.com

How to add a custom field to existing entity in MedusaJS - Stack Overflow

Abre em uma nova janela](https://stackoverflow.com/questions/75269182/how-to-add-a-custom-field-to-existing-entity-in-medusajs)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.test.tglsupplies.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.test.tglsupplies.com

How to Extend an Entity - Medusa Documentation

Abre em uma nova janela](https://docs.test.tglsupplies.com/development/entities/extend-entity/)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

3.6.10. Pass Additional Data to Medusa's API Route

Abre em uma nova janela](https://docs.medusajs.com/learn/fundamentals/api-routes/additional-data)[

![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

We need to talk about custom attributes · medusajs medusa · Discussion #5303 - GitHub

Abre em uma nova janela](https://github.com/medusajs/medusa/discussions/5303)[

![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Add Custom Data to Cart and Order Line Items - Medusa.js

Abre em uma nova janela](https://medusajs.com/blog/add-custom-data-cart-order-line-items/)[

![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

medusajs/product-module-demo - GitHub

Abre em uma nova janela](https://github.com/medusajs/product-module-demo)[

![](https://t0.gstatic.com/faviconV2?url=https://medium.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medium.com

Build An Ecommerce Store from Scratch using Medusa and Nuxt: Part 02 | by Mark Munyaka

Abre em uma nova janela](https://medium.com/@markmunyaka/build-an-ecommerce-store-from-scratch-using-medusa-and-nuxt-part-02-405e8fa369f2)[

![](https://t0.gstatic.com/faviconV2?url=https://dev.to/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

dev.to

Building a store for digital products with Next.js and Medusa - DEV Community

Abre em uma nova janela](https://dev.to/medusajs/building-a-store-for-digital-products-with-nextjs-and-medusa-1o6m)[

![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Add Personalized Product Options - Medusa.js

Abre em uma nova janela](https://medusajs.com/blog/add-personalized-product-options/)[

![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Implement Custom Product Builder in Medusa

Abre em uma nova janela](https://medusajs.com/blog/custom-product-builder-tutorial/)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Image - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/v1/references/entities/classes/Image)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Image - Medusa Docs

Abre em uma nova janela](https://docs.medusajs.com/v1/references/medusa/classes/medusa.Image)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

uploadFilesWorkflow - Medusa Core Workflows Reference

Abre em uma nova janela](https://docs.medusajs.com/resources/references/medusa-workflows/uploadFilesWorkflow)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

File Service - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/v1/development/file-service/overview)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

How to Use File Module - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/resources/references/file-service)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Create Bundle Product in Medusa Admin

Abre em uma nova janela](https://docs.medusajs.com/user-guide/products/create/bundle)[

![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Medusa.js

Abre em uma nova janela](https://medusajs.com/)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

How-to & Tutorials - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/resources/how-to-tutorials)[

![](https://t0.gstatic.com/faviconV2?url=https://dev.to/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

dev.to

How to Display Products with Medusa - DEV Community

Abre em uma nova janela](https://dev.to/nazimboudeffa/how-to-display-products-with-medusa-god)[

![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Product Module - Medusa Documentation

Abre em uma nova janela](https://docs.medusajs.com/resources/commerce-modules/product)[

![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

Delete product images · medusajs medusa · Discussion #5149 - GitHub

Abre em uma nova janela](https://github.com/medusajs/medusa/discussions/5149)[

![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Use ChatGPT to Automate Product Description Writing - Medusa.js

Abre em uma nova janela](https://medusajs.com/blog/chatgpt-medusa/)[

![](https://t1.gstatic.com/faviconV2?url=https://qacomet.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

qacomet.com

Medusa case study - QAComet

Abre em uma nova janela](https://qacomet.com/case-studies/medusa/)[

![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Product Categorization: B2B Best Practices - Medusa.js

Abre em uma nova janela](https://medusajs.com/blog/what-i-learned-from-studying-500-b2b-ecommerce-sites/)

Análise de Inventário e KPIs Financeiros

Iniciei o processo de varredura do inventário a partir dos diretórios dos distribuidores (Fortlev, Fotus, NeoSolar, Odex, Solfacil). Consegui criar o primeiro 'Blueprint 360° de Inventário' que abstrai os nomes dos distribuidores e consolida mais de 50 fabricantes em 7 categorias. Em seguida, realizei uma análise aprofundada de precificação e performance, integrando dados de irradiação solar (PVGIS, NREL, NASA POWER). As principais descobertas indicam que a tecnologia Tier 2 PERC atualmente maximiza o Valor Presente Líquido (VPL) para a maioria dos casos residenciais, superando o Tier 1 em Payback e TIR, e que o Brasil possui um custo 30% mais alto que o mercado global devido a impostos. A análise também aponta que o armazenamento (BESS) ainda não é economicamente viável no curto prazo (Payback de 14 anos) sem uma redução de 40% nos custos da bateria.

Status da Implementação de APIs (Helios)

Fiz uma revisão detalhada do status das APIs do Projeto Helios, crucial para a automação de processos. Descobri que as APIs de Distribuidoras e Webhooks estão 100% funcionais, e que a infraestrutura do módulo INMETRO está pronta, mas faltam 5 dias úteis para completar a integração com Redis e PostgreSQL para validação em tempo real. Identifiquei que as APIs de Autenticação estão 60% prontas e o módulo de Documentos (geração de memoriais/diagramas) ainda não foi iniciado. O plano de ação prioriza a integração INMETRO imediatamente devido ao seu alto Retorno sobre o Investimento (ROI), que reduzirá o tempo de validação de dias para segundos.

Arquitetura de Finanças e Personas

Completei a estruturação do 'Metaplan' de Personas, definindo 6 perfis de clientes (Residencial Padrão, Tarifa Social, Comercial PME, Industrial MT, Rural Agro, Multisites/Condomínios) com seus gatilhos, dores, saídas esperadas e fluxos de trabalho recomendados. Paralelamente, implementei um sistema completo de APIs em tempo real do Banco Central (BACEN) para calcular KPIs financeiros (ROI, TIR, VPL, LCOE) com máxima acurácia para cada uma dessas personas. Este sistema inclui cache, integração com séries SGS do BCB, e um novo serviço para calcular a irradiação solar (HSP) via PVGIS/NREL, além de um serviço de Leaderboards que pontua equipamentos baseados em métricas técnico-financeiras.

Reestruturação Crítica do Inventário (Medusa.js)

Realizei uma análise crítica da adequação do inventário atual para a plataforma Medusa.js. O esquema anterior, que modelava kits como um único produto com JSON aninhado, foi identificado como um ponto fraco devido à dificuldade em gerenciar estoque real de sub-componentes. Como solução, defini uma nova arquitetura de 'Bundles' e 'SKUs Agnósticos'. Isso significa que cada painel ou inversor será um produto individual com estoque real (Multi-Location Inventory), e os kits serão produtos virtuais (Bundles) que agrupam esses componentes via metadados. Esta mudança exige o desenvolvimento de Workflows e Services customizados no Medusa para calcular dinamicamente o estoque e o preço dos kits.

Planejamento de Implementação da Nova Arquitetura

Com a nova arquitetura definida, comecei a fase de especificação end-to-end, detalhando como as entidades do Medusa.js (`Product`, `ProductVariant`, `StockLocation`, `InventoryLevel`) serão usadas para implementar SKUs Agnósticos e Kits Virtuais. Criei um plano de trabalho para desenvolver os Workflows essenciais (`add-bundle-to-cart`, `remove-bundle-from-cart`) e uma API customizada para a apresentação dos detalhes dos bundles no frontend. Na última etapa, dei início à atualização dos schemas e agentes existentes para refletir essa nova estrutura, focando na refatoração do `kit-builder-agent` para se tornar o 'Bundle Builder Agent'. Meu próximo passo é pesquisar a fundo a documentação oficial do Medusa.js para garantir que os 'mega prompts' de implementação sigam rigorosamente os padrões de Workflows, Bundles e gestão de imagens/fichas técnicas.

![](https://www.gstatic.com/lamda/images/immersives/google_logo_icon_2380fba942c84387f09cf.svg)

Researching websites

[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

3.3. Modules - Medusa Documentation

](https://docs.medusajs.com/learn/fundamentals/modules)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

3.10. Plugins - Medusa Documentation

](https://docs.medusajs.com/learn/fundamentals/plugins)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Plugins - Medusa Documentation

](https://docs.medusajs.com/v1/development/plugins/overview)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Medusa Documentation

](https://docs.medusajs.com/v1/)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

3.5. Data Models - Medusa Documentation

](https://docs.medusajs.com/learn/fundamentals/data-models)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Medusa Documentation

](https://docs.medusajs.com/)[![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

medusajs/medusa: The world's most flexible commerce platform. - GitHub

](https://github.com/medusajs/medusa)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

ProductOption - Product Module Data Models Reference - Medusa Documentation

](https://docs.medusajs.com/resources/references/product/models/ProductOption)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Welcome to Medusa's User Guide

](https://docs.medusajs.com/v1/user-guide)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Product Module Data Models Reference - Medusa Documentation

](https://docs.medusajs.com/resources/references/product/models/Product)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Medusa.js

](https://medusajs.com/)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

3.5.2. Data Model Properties - Medusa Documentation

](https://docs.medusajs.com/learn/fundamentals/data-models/properties)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Medusa Data Model Language Reference

](https://docs.medusajs.com/resources/references/data-model)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Product Module - Medusa

](https://medusajs.com/product-module/)[![](https://t3.gstatic.com/faviconV2?url=https://www.freecodecamp.org/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

freecodecamp.org

Component-Based Architecture in Medusa – How to Build Robust User Interfaces

](https://www.freecodecamp.org/news/exploring-component-based-architecture-in-medusa-building-robust-user-interfaces/)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

V2 Overview - Medusa

](https://medusajs.com/v2-overview/)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

1.3. Medusa's Architecture

](https://docs.medusajs.com/learn/introduction/architecture)[![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

Releases · medusajs/medusa - GitHub

](https://github.com/medusajs/medusa/releases)[![](https://t0.gstatic.com/faviconV2?url=https://medium.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medium.com

Exploring Medusa's Composable Architecture | by Ekisoweidaniel - Medium

](https://medium.com/@ekisoweidaniel/exploring-medusas-composable-architecture-59ef3f42c46b)[![](https://t2.gstatic.com/faviconV2?url=https://www.rigbyjs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

rigbyjs.com

A Closer Look at Medusa.js: Features Overview | Rigby Blog

](https://www.rigbyjs.com/blog/medusajs-features-overview)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Beginner Guide to a Node.js Ecommerce: Understanding Medusa's Server

](https://medusajs.com/blog/beginner-guide-to-node-js-ecommerce-platform-understanding-the-medusa-server/)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Manage Product Variants in Medusa Admin - Medusa Admin User Guide

](https://docs.medusajs.com/user-guide/products/variants)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Products Architecture Overview - Medusa Documentation

](https://docs.medusajs.com/v1/modules/products)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

ProductVariant - Medusa Documentation

](https://docs.medusajs.com/v1/references/entities/classes/ProductVariant)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Product Variants - Medusa Documentation

](https://docs.medusajs.com/v1/references/medusa-react/hooks/admin/product_variants)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

ProductVariantReq - Medusa Docs

](https://docs.medusajs.com/v1/references/medusa/classes/medusa.ProductVariantReq)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Select Product Variants in Storefront - Medusa Documentation

](https://docs.medusajs.com/resources/storefront-development/products/variants)

Validação da Arquitetura Medusa.js

Para garantir a máxima acurácia na refatoração do inventário para o Medusa.js, realizei uma pesquisa aprofundada na documentação oficial. Confirmei que o Medusa suporta nativamente a arquitetura modular e headless que estamos construindo. A documentação aponta para recursos cruciais, como 'Bundled Products' e 'Multi-part Products and Shared Inventory', que validam minha decisão de migrar de kits aninhados para um modelo de 'Bundles' com componentes individuais e estoque compartilhado. Este é o caminho correto para garantir escalabilidade e gerenciamento de inventário preciso.

Componentes Chave para Implementação

A pesquisa detalhada nos recursos do Medusa me permitiu identificar os módulos exatos que precisarei utilizar. O gerenciamento de estoque será feito através da associação de múltiplos `InventoryLevel` a uma única `ProductVariant` (componente), o que suporta nossa estratégia de SKUs Agnósticos e múltiplos distribuidores. Além disso, a arquitetura de `Workflows` do Medusa 2.0 será fundamental para orquestrar a lógica de negócio complexa, como a verificação e reserva de estoque de vários componentes quando um 'Bundle' é adicionado ao carrinho, conforme planejado anteriormente.

Próximos Passos: Detalhamento de Fichas Técnicas

Tendo validado a arquitetura de dados e workflows no Medusa.js, meu foco agora é consolidar os dados de produto mais sensíveis ao cliente: as fichas técnicas e as imagens. O próximo passo será executar uma série de pesquisas direcionadas para encontrar as URLs exatas (URLs de ficha técnica e URLs de imagem) para cada SKU no nosso inventário, o que permitirá enriquecer o catálogo do Medusa.js com dados visuais e técnicos essenciais para a experiência do usuário.

![](https://www.gstatic.com/lamda/images/immersives/google_logo_icon_2380fba942c84387f09cf.svg)

Researching websites

[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Medusa Documentation

](https://docs.medusajs.com/)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Product Module Data Models Reference - Medusa Documentation

](https://docs.medusajs.com/resources/references/product/models/Product)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

V2 Overview - Medusa

](https://medusajs.com/v2-overview/)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

1.3. Medusa's Architecture - Medusa Documentation

](https://docs.medusajs.com/learn/introduction/architecture)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Manage Product Variants in Medusa Admin - Medusa Admin User ...

](https://docs.medusajs.com/user-guide/products/variants)

Validação da Arquitetura de Bundles

Concluí a validação da arquitetura de inventário na documentação oficial da plataforma, confirmando que a estratégia de migrar de kits aninhados para um modelo de 'Bundles' e 'SKUs Agnósticos' está alinhada com os recursos nativos e as melhores práticas da plataforma. Os resultados da pesquisa reforçam que devo utilizar os módulos de 'Workflows' para orquestrar a lógica complexa de reservas de estoque de componentes e a arquitetura de 'Multi-Warehouse' (`InventoryLevel`) para gerenciar o inventário de múltiplos distribuidores em uma única variante (componente).

Foco na Experiência do Produto

A fase de reestruturação dos schemas e agentes está sendo direcionada para suportar a nova modelagem de dados. A próxima prioridade é garantir que o catálogo enriquecido possua todas as informações cruciais para a venda. Isso inclui a coleta e associação de URLs de imagens e URLs de fichas técnicas para cada componente individual e para os kits, permitindo uma apresentação completa e informativa no frontend.

Plano de Ação para Enriquecimento do Catálogo

Meu foco agora é executar uma pesquisa precisa para encontrar as URLs das fichas técnicas e imagens dos produtos de nosso inventário. Em seguida, buscarei tutoriais específicos sobre como estender a entidade de Produto da plataforma para incluir campos customizados, como o URL da ficha técnica, e como integrar esta informação na API para ser consumida pelo frontend, garantindo que o novo catálogo atenda aos requisitos de máxima performance e eficácia.

![](https://www.gstatic.com/lamda/images/immersives/google_logo_icon_2380fba942c84387f09cf.svg)

Researching websites

[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Create Product in Medusa Admin - Medusa Admin User Guide

](https://docs.medusajs.com/user-guide/products/create)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Bundled Products Recipe - Medusa Documentation

](https://docs.medusajs.com/resources/recipes/bundled-products)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Create Bundle Product in Medusa Admin

](https://docs.medusajs.com/user-guide/products/create/bundle)[![](https://t3.gstatic.com/faviconV2?url=https://kvytechnology.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

kvytechnology.com

Streamlining Product Management with Medusa.js: Tips and Tricks - KVY TECH

](https://kvytechnology.com/blog/software/product-management-with-medusa-js/)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Medusa Documentation

](https://docs.medusajs.com/)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Inventory Kits - Medusa Documentation

](https://docs.medusajs.com/resources/commerce-modules/inventory/inventory-kit)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Implement Bundled Products in Medusa

](https://medusajs.com/blog/bundled-products/)[![](https://t0.gstatic.com/faviconV2?url=https://medium.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medium.com

Building a multivendor marketplace with Medusa.js 2.0: a Dev guide (Part 1) - Medium

](https://medium.com/@igorkhomenko/building-a-multivendor-marketplace-with-medusa-js-2-0-a-dev-guide-f55aec971126)[![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

Agilo/medusa-plugin-bundles: Group products together in product bundles. - GitHub

](https://github.com/Agilo/medusa-plugin-bundles)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

ProductImage - Product Module Data Models Reference - Medusa Documentation

](https://docs.medusajs.com/resources/references/product/models/ProductImage)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Medusa.js

](https://medusajs.com/)[![](https://t0.gstatic.com/faviconV2?url=https://dev.to/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

dev.to

How to Display Products with Medusa - DEV Community

](https://dev.to/nazimboudeffa/how-to-display-products-with-medusa-god)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Implement Bundled Products in Medusa

](https://docs.medusajs.com/resources/recipes/bundled-products/examples/standard)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Implement Custom Product Builder in Medusa

](https://medusajs.com/blog/custom-product-builder-tutorial/)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Inventory Module - Medusa

](https://medusajs.com/inventory-module/)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Extend Product Data Model - Medusa Documentation

](https://docs.medusajs.com/resources/commerce-modules/product/extend)[![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

[Bug]: "medusa build" does not bundle plugin admin widgets · Issue #11656 - GitHub

](https://github.com/medusajs/medusa/issues/11656)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Integrate your commerce stack with your favorite tools - Medusa.js

](https://medusajs.com/integrations/)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Extend Customer Data Model - Medusa Documentation

](https://docs.medusajs.com/resources/commerce-modules/customer/extend)[![](https://t1.gstatic.com/faviconV2?url=https://community.weweb.io/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

community.weweb.io

Using Medusa.js and NPM plugin to build out an e-commerce backend - Optimal Solution?

](https://community.weweb.io/t/using-medusa-js-and-npm-plugin-to-build-out-an-e-commerce-backend-optimal-solution/7439)[![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

[docs] Add article/tutorial that outlines custom attribute addition to product entity including UI · medusajs medusa · Discussion #5133 - GitHub

](https://github.com/medusajs/medusa/discussions/5133)[![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

Custom Fields API · medusajs medusa · Discussion #1947 - GitHub

](https://github.com/medusajs/medusa/discussions/1947)[![](https://t0.gstatic.com/faviconV2?url=https://stackoverflow.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

stackoverflow.com

How to add a custom field to existing entity in MedusaJS - Stack Overflow

](https://stackoverflow.com/questions/75269182/how-to-add-a-custom-field-to-existing-entity-in-medusajs)[![](https://t3.gstatic.com/faviconV2?url=https://docs.test.tglsupplies.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.test.tglsupplies.com

How to Extend an Entity - Medusa Documentation

](https://docs.test.tglsupplies.com/development/entities/extend-entity/)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

3.6.10. Pass Additional Data to Medusa's API Route

](https://docs.medusajs.com/learn/fundamentals/api-routes/additional-data)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Personalized Products - Medusa Documentation

](https://docs.medusajs.com/v1/recipes/personalized-products)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Add Personalized Product Options - Medusa.js

](https://medusajs.com/blog/add-personalized-product-options/)[![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

We need to talk about custom attributes · medusajs medusa · Discussion #5303 - GitHub

](https://github.com/medusajs/medusa/discussions/5303)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Product Module - Medusa

](https://medusajs.com/product-module/)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Add Custom Data to Cart and Order Line Items - Medusa.js

](https://medusajs.com/blog/add-custom-data-cart-order-line-items/)

Confirmação da Estrutura de Bundles

A pesquisa detalhada na documentação oficial da plataforma de comércio eletrônico validou integralmente a estratégia arquitetônica que definimos. Confirmei que o modelo de 'Bundles' (Kits Solares) deve ser implementado via customização, potencialmente utilizando a Receita Oficial de Produtos em Pacote ou a funcionalidade nativa de 'Inventory Kits'. A abordagem de criar componentes como produtos individuais, gerenciando seus estoques em múltiplas localizações (distribuidores) sob um único SKU agnóstico, é a solução mais robusta e flexível para nosso cenário B2B, permitindo precificação e logística avançadas.

Necessidade de Extensão da Entidade Produto

Para incorporar dados cruciais como URLs de Fichas Técnicas e Informações de Certificação que não se encaixam nos campos padrão, identifiquei a necessidade de estender a entidade principal de Produto. A plataforma oferece mecanismos claros para adicionar campos customizados (`metadata` ou customização de módulos) e gerenciar a associação de imagens (`ProductImage`). Isso garantirá que o frontend possa exibir informações técnicas ricas para cada componente do kit.

Prioridade: Geração de Mega Prompts e Enriquecimento

Com a arquitetura validada e os caminhos de customização mapeados, meu foco se volta para a síntese dessas descobertas. Agora, irei criar os 'mega prompts' detalhados que servirão como guia de implementação técnica. Simultaneamente, avançarei na busca pelas URLs de Fichas Técnicas e Imagens dos produtos no inventário. Essas informações visuais e documentais são essenciais para enriquecer o catálogo e finalizar a fase de modelagem de dados, preparando a plataforma para a execução dos Workflows e APIs.

![](https://www.gstatic.com/lamda/images/immersives/google_logo_icon_2380fba942c84387f09cf.svg)

Researching websites

[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

ProductImage - Product Module Data Models Reference - Medusa ...

](https://docs.medusajs.com/resources/references/product/models/ProductImage)[![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

Agilo/medusa-plugin-bundles: Group products together in ... - GitHub

](https://github.com/Agilo/medusa-plugin-bundles)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Extend Product Data Model - Medusa Documentation

](https://docs.medusajs.com/resources/commerce-modules/product/extend)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Bundled Products Recipe - Medusa Documentation

](https://docs.medusajs.com/resources/recipes/bundled-products)

Validação Final da Arquitetura Medusa

Realizei uma validação final minuciosa da estratégia de inventário na documentação oficial da plataforma. Confirmei que a abordagem de modelar Kits Solares como 'Bundles' customizados, e não como produtos simples, está em linha com a flexibilidade da arquitetura. Essa validação detalhada do modelo de `ProductVariant`, `Inventory Kits` e `Workflows` me deu a confiança necessária para prosseguir com a implementação, garantindo que a gestão de estoque e a precificação de nossos kits sejam robustas e escaláveis no ambiente B2B.

Fichas Técnicas e Imagens (Gap de Informação)

Durante a pesquisa, consegui validar que o caminho para adicionar URLs de fichas técnicas e certificações é via extensão da entidade principal de Produto, o que é uma prática recomendada. No entanto, identifiquei uma lacuna no conhecimento de como gerenciar e fazer upload de imagens de produtos de forma programática na plataforma. Embora a entidade `ProductImage` seja a responsável, ainda preciso de um guia prático para automatizar a associação de URLs de imagens ao nosso vasto catálogo de produtos.

Próximos Passos de Pesquisa

Para preencher a lacuna de informação sobre gerenciamento de ativos, vou realizar uma busca direcionada por tutoriais e exemplos práticos que demonstrem como adicionar imagens e outros arquivos a produtos usando as APIs e serviços internos da plataforma de comércio. Adicionalmente, buscarei exemplos de projetos de código aberto que implementaram a receita de 'Bundles' ou catálogos complexos, para garantir que os 'mega prompts' que irei gerar sejam baseados nas melhores práticas da comunidade.

![](https://www.gstatic.com/lamda/images/immersives/google_logo_icon_2380fba942c84387f09cf.svg)

Researching websites

[![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

Agilo/medusa-plugin-bundles: Group products together in product bundles. - GitHub

](https://github.com/Agilo/medusa-plugin-bundles)[![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

medusajs/product-module-demo - GitHub

](https://github.com/medusajs/product-module-demo)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Create Product in Medusa Admin - Medusa Admin User Guide

](https://docs.medusajs.com/user-guide/products/create)[![](https://t0.gstatic.com/faviconV2?url=https://medium.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medium.com

Build An Ecommerce Store from Scratch using Medusa and Nuxt: Part 02 | by Mark Munyaka

](https://medium.com/@markmunyaka/build-an-ecommerce-store-from-scratch-using-medusa-and-nuxt-part-02-405e8fa369f2)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

ProductImage - Product Module Data Models Reference - Medusa Documentation

](https://docs.medusajs.com/resources/references/product/models/ProductImage)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Edit Product in Medusa Admin - Medusa Admin User Guide - Medusa Documentation

](https://docs.medusajs.com/user-guide/products/edit)[![](https://t0.gstatic.com/faviconV2?url=https://dev.to/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

dev.to

Building a store for digital products with Next.js and Medusa - DEV Community

](https://dev.to/medusajs/building-a-store-for-digital-products-with-nextjs-and-medusa-1o6m)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Add Personalized Product Options - Medusa.js

](https://medusajs.com/blog/add-personalized-product-options/)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Implement Custom Product Builder in Medusa

](https://medusajs.com/blog/custom-product-builder-tutorial/)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Spaces - Medusa Docs

](https://docs.medusajs.com/v1/plugins/file-service/spaces)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Image - Medusa Documentation

](https://docs.medusajs.com/v1/references/entities/classes/Image)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Image - Medusa Docs

](https://docs.medusajs.com/v1/references/medusa/classes/medusa.Image)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

uploadFilesWorkflow - Medusa Core Workflows Reference

](https://docs.medusajs.com/resources/references/medusa-workflows/uploadFilesWorkflow)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

upload - JS SDK Admin Reference - Medusa Documentation

](https://docs.medusajs.com/resources/references/js-sdk/admin/upload)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

File Service - Medusa Documentation

](https://docs.medusajs.com/v1/development/file-service/overview)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Implement Bundled Products in Medusa

](https://docs.medusajs.com/resources/recipes/bundled-products/examples/standard)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Bundled Products Recipe - Medusa Documentation

](https://docs.medusajs.com/resources/recipes/bundled-products)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

S3 - Medusa Docs

](https://docs.medusajs.com/v1/plugins/file-service/s3)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Digital Products Recipe Example - Medusa Documentation

](https://docs.medusajs.com/resources/recipes/digital-products/examples/standard)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

How to Use File Module - Medusa Documentation

](https://docs.medusajs.com/resources/references/file-service)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Create Bundle Product in Medusa Admin

](https://docs.medusajs.com/user-guide/products/create/bundle)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Medusa.js

](https://medusajs.com/)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

How-to & Tutorials - Medusa Documentation

](https://docs.medusajs.com/resources/how-to-tutorials)[![](https://t0.gstatic.com/faviconV2?url=https://dev.to/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

dev.to

How to Display Products with Medusa - DEV Community

](https://dev.to/nazimboudeffa/how-to-display-products-with-medusa-god)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

Product Module - Medusa Documentation

](https://docs.medusajs.com/resources/commerce-modules/product)[![](https://t3.gstatic.com/faviconV2?url=https://docs.medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

docs.medusajs.com

File Module - Medusa Documentation

](https://docs.medusajs.com/resources/infrastructure-modules/file)[![](https://t1.gstatic.com/faviconV2?url=https://github.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

github.com

Delete product images · medusajs medusa · Discussion #5149 - GitHub

](https://github.com/medusajs/medusa/discussions/5149)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Catalog: Building a B2B Platform for SMBs with Medusa

](https://medusajs.com/blog/catalog/)[![](https://t2.gstatic.com/faviconV2?url=https://www.linearloop.io/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

linearloop.io

Why MedusaJS is the Future of Headless Ecommerce - Linearloop

](https://www.linearloop.io/blog/medusa-js-headless-ecommerce-guide)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Use ChatGPT to Automate Product Description Writing - Medusa.js

](https://medusajs.com/blog/chatgpt-medusa/)[![](https://t1.gstatic.com/faviconV2?url=https://qacomet.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

qacomet.com

Medusa case study - QAComet

](https://qacomet.com/case-studies/medusa/)[![](https://t2.gstatic.com/faviconV2?url=https://medusajs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

medusajs.com

Product Categorization: B2B Best Practices - Medusa.js

](https://medusajs.com/blog/what-i-learned-from-studying-500-b2b-ecommerce-sites/)[![](https://t2.gstatic.com/faviconV2?url=https://www.rigbyjs.com/&client=BARD&type=FAVICON&size=256&fallback_opts=TYPE,SIZE,URL)

rigbyjs.com

A Closer Look at Medusa.js: Features Overview | Rigby Blog

](https://www.rigbyjs.com/blog/medusajs-features-overview)

Conclusão do Mapeamento de Arquitetura

Realizei a última etapa de investigação para consolidar a implementação da nova arquitetura de inventário na plataforma de comércio eletrônico. Confirmei que o caminho ideal para lidar com a complexidade de 'Kits Solares' e 'Múltiplos Distribuidores' passa pela utilização de Workflows customizados e a modelagem de Kits como 'Bundles', usando a funcionalidade de 'Inventory Kits' e extensões da entidade de Produto. Isso valida completamente o plano de refatoração que desenvolvemos, garantindo que a base do catálogo seja escalável para o cenário B2B.

Preenchimento de Lacuna em Uploads Programáticos

Apesar do vasto conhecimento adquirido, identifiquei uma última lacuna técnica a ser preenchida: a automação do upload e associação de imagens e documentos de Ficha Técnica. Embora saiba que a entidade `ProductImage` deve ser usada, me falta um guia prático e focado no desenvolvedor que detalhe como interagir com o serviço de upload de arquivos (File Service) via API e associar essas URLs aos produtos dentro de um fluxo de trabalho customizado. Este é o último detalhe técnico para garantir que o processo de enriquecimento do catálogo seja totalmente automatizado.

Ações Finais de Síntese

Com a arquitetura robusta e quase todos os detalhes técnicos mapeados, meu foco agora é obter as últimas informações sobre como manipular arquivos de forma programática na plataforma. Após isso, terei atingido a saturação de pesquisa e estarei pronto para sintetizar todas as descobertas, gerando os 'mega prompts' de implementação que detalharão, passo a passo, a criação dos Workflows, dos Bundles e a associação final das URLs de imagens e Fichas Técnicas ao catálogo, concluindo a fase de planejamento técnico-arquitetural.