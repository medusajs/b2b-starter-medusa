"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManyLines = exports.Default = void 0;
var react_1 = require("react");
var tooltip_1 = require("../tooltip");
var code_block_1 = require("./code-block");
var meta = {
    title: "Components/CodeBlock",
    component: code_block_1.CodeBlock,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
var snippets = [
    {
        label: "cURL",
        language: "markdown",
        code: "curl -H 'x-publishable-key: YOUR_API_KEY' 'http://localhost:9000/store/products/PRODUCT_ID'",
    },
    {
        label: "Medusa JS Client",
        language: "jsx",
        code: "// Install the JS Client in your storefront project: @medusajs/medusa-js\n\nimport Medusa from \"@medusajs/medusa-js\"\n\nconst medusa = new Medusa({ publishableApiKey: \"YOUR_API_KEY\"})\nconst product = await medusa.products.retrieve(\"PRODUCT_ID\")\nconsole.log(product.id)",
    },
    {
        label: "Medusa React",
        language: "tsx",
        code: "// Install the React SDK and required dependencies in your storefront project:\n// medusa-react @tanstack/react-query @medusajs/medusa\n\nimport { useProduct } from \"medusa-react\"\n\nconst { product } = useProduct(\"PRODUCT_ID\")\nconsole.log(product.id)",
    },
];
exports.Default = {
    render: function () {
        return (<tooltip_1.TooltipProvider>
        <div className="h-[300px] w-[700px]">
          <code_block_1.CodeBlock snippets={snippets}>
            <code_block_1.CodeBlock.Header></code_block_1.CodeBlock.Header>
            <code_block_1.CodeBlock.Body>
              <span>/store/products/:id</span>
            </code_block_1.CodeBlock.Body>
          </code_block_1.CodeBlock>
        </div>
      </tooltip_1.TooltipProvider>);
    },
};
var generateStartupLog = function () {
    var services = [
        { name: "Models", time: 14 },
        { name: "Repositories", time: 35 },
        { name: "Strategies", time: 24 },
        { name: "Modules", time: 1 },
        { name: "Database", time: 654 },
        { name: "Services", time: 7 },
        { name: "Express", time: 5 },
        { name: "Plugins", time: 7 },
        { name: "Subscribers", time: 6 },
        { name: "API", time: 28 },
        { name: "Cache", time: 12 },
        { name: "Queue", time: 45 },
        { name: "Middleware", time: 8 },
        { name: "WebSockets", time: 15 },
        { name: "Authentication", time: 42 },
    ];
    var lines = services.flatMap(function (service) { return [
        "\u2714 ".concat(service.name, " initialized \u2013 ").concat(service.time, "ms"),
        "\u2714 ".concat(service.name, " validated \u2013 ").concat(service.time + 5, "ms"),
        "\u2714 ".concat(service.name, " configured \u2013 ").concat(service.time + 10, "ms"),
        "\u2714 ".concat(service.name, " optimized \u2013 ").concat(service.time + 3, "ms"),
    ]; });
    return "medusa develop\n".concat(lines.join("\n"), "\n\u2714 Server is ready on port: 9000");
};
var code = generateStartupLog();
exports.ManyLines = {
    render: function () {
        return (<tooltip_1.TooltipProvider>
        <code_block_1.CodeBlock snippets={[
                {
                    code: code,
                    label: "Test",
                    language: "bash",
                    hideCopy: true,
                },
            ]} className="h-full max-h-[300px] w-[700px]">
          <code_block_1.CodeBlock.Header></code_block_1.CodeBlock.Header>
          <code_block_1.CodeBlock.Body />
        </code_block_1.CodeBlock>
      </tooltip_1.TooltipProvider>);
    },
};
