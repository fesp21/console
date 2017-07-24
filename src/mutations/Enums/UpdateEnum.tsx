import { graphql } from 'react-relay'
import { makeMutation } from '../../utils/makeMutation'

interface Props {
  enumId: string
  name: string
  values: string[]
}

const mutation = graphql`
  mutation UpdateEnumMutation($input: UpdateEnumInput!) {
    updateEnum(input: $input) {
      enum {
        id
        name
        values
      }
    }
  }
`

function commit(props: Props) {
  return makeMutation({
    mutation,
    variables: props,
    configs: [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        enum: props.enumId,
      },
    }],
  })
}

export default { commit }
