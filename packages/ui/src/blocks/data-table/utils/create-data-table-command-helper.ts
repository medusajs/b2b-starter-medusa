import { DataTableCommand } from "../types"

const createDataTableCommandHelper = () => ({
  command: (command: DataTableCommand) => command,
})

export { createDataTableCommandHelper }

