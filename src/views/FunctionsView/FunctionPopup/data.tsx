export type FunctionBinding =
  | 'TRANSFORM_ARGUMENT'
  | 'PRE_WRITE'
  | 'TRANSFORM_PAYLOAD'
const texts = {
  TRANSFORM_ARGUMENT: `, you can manipulate your data before it get’s validated by our
    Constraints and Permissions APIs. Use this to transform credit card numbers, slugs etc.`,
  PRE_WRITE: `, you can validate your data before it gets written to the database.
    Use this to perform a stripe transaction etc.
  `,
  TRANSFORM_PAYLOAD: `, you can manipulate the data that will be sent back to the client.
  Use this to remove secret fields etc.
  `,
}

export function getText(binding: FunctionBinding) {
  return texts[binding]
}
