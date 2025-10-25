# Custom CLI Script

A custom CLI script is a function to execute through Medusa's CLI tool. This is useful when creating custom Medusa tooling to run as a CLI tool.

## How to Create a Custom CLI Script?

To create a custom CLI script, create a TypeScript or JavaScript file under the `src/scripts` directory. The file must default export a function.

For example, create the file `src/scripts/my-script.ts` with the following content:

```ts title="src/scripts/my-script.ts"
import { ExecArgs, IProductModuleService } from "@medusajs/framework/types";
import { ModuleRegistrationName } from "@medusajs/framework/utils";

export default async function myScript({ container }: ExecArgs) {
  const productModuleService: IProductModuleService = container.resolve(
    ModuleRegistrationName.PRODUCT
  );

  const [, count] = await productModuleService.listAndCount();

  console.log(`You have ${count} product(s)`);
}
```

The function receives as a parameter an object having a `container` property, which is an instance of the Medusa Container. Use it to resolve resources in your Medusa application.

---

## How to Run Custom CLI Script?

To run the custom CLI script, run the `exec` command:

```bash
npx medusa exec ./src/scripts/my-script.ts
```

---

## Custom CLI Script Arguments

Your script can accept arguments from the command line. Arguments are passed to the function's object parameter in the `args` property.

For example:

```ts
import { ExecArgs } from "@medusajs/framework/types";

export default async function myScript({ args }: ExecArgs) {
  console.log(`The arguments you passed: ${args}`);
}
```

Then, pass the arguments in the `exec` command after the file path:

```bash
npx medusa exec ./src/scripts/my-script.ts arg1 arg2
```

---

## Scripts de Teste do Catálogo YSH

### Como usar

#### 1. Testar caminhos do catálogo

```bash
# De qualquer diretório
node medusa-starter/backend/src/scripts/test-catalog-paths.ts
```

#### 2. Iniciar servidor de teste

```bash
# De qualquer diretório
node medusa-starter/backend/src/scripts/start-test-server.ts
```

#### 3. Executar testes das APIs

```bash
# De qualquer diretório (servidor deve estar rodando)
node medusa-starter/backend/src/scripts/run-api-tests.ts
```

### APIs Disponíveis

- `GET /store/catalog` - Visão geral do catálogo
- `GET /store/catalog/:category` - Produtos por categoria
- `GET /store/catalog/:category/:id` - Produto específico
- `GET /store/catalog/search?q=termo` - Busca global
- `GET /store/catalog/manufacturers` - Lista de fabricantes

### Categorias suportadas

- kits - Kits solares completos
- panels - Painéis solares
- inverters - Inversores
- cables - Cabos e conectores
- chargers - Carregadores elétricos
- controllers - Controladores de carga
- accessories - Acessórios diversos
- structures - Estruturas de montagem
- batteries - Baterias
- stringboxes - Caixas de string
- posts - Postes e suportes
- others - Outros produtos

### Exemplo de uso

```bash
# 1. Testar se tudo está funcionando
node medusa-starter/backend/src/scripts/test-catalog-paths.ts

# 2. Iniciar servidor (em background)
node medusa-starter/backend/src/scripts/start-test-server.ts &

# 3. Executar testes
node medusa-starter/backend/src/scripts/run-api-tests.ts
```
