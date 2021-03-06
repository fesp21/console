import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { Project, ServerlessFunction } from '../../types/types'
import mapProps from '../../components/MapProps/MapProps'
import FunctionsList from './FunctionsList'
import FunctionsHeader from './FunctionsHeader'
import Helmet from 'react-helmet'

interface Props {
  project: Project
  functions: ServerlessFunction
  params: any
}

import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'

class FunctionsView extends React.Component<Props, {}> {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    return (
      <div className="functions-view">
        <style jsx>{`
          .functions-view {
          }
        `}</style>
        <Helmet title="Functions" />
        <FunctionsHeader params={this.props.params} />
        <FunctionsList
          project={this.props.project}
          params={this.props.params}
        />
        {this.props.children}
      </div>
    )
  }
}

const MappedFunctionsView = mapProps({
  project: props => props.viewer.project,
})(FunctionsView)

export default createFragmentContainer(MappedFunctionsView, {
  viewer: graphql`
    fragment FunctionsView_viewer on Viewer {
      id
      project: projectByName(projectName: $projectName) {
        id
        name
        ...FunctionsList_project
      }
      user {
        crm {
          information {
            isBeta
          }
        }
      }
    }
  `,
})
