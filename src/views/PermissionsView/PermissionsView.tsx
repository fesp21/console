import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import Helmet from 'react-helmet'
import mapProps from '../../components/MapProps/MapProps'
import { Project } from '../../types/types'
import PermissionsHeader from './PermissionsHeader/PermissionsHeader'
import { $p } from 'graphcool-styles'
import * as cx from 'classnames'
import tracker from '../../utils/metrics'
import { ConsoleEvents } from 'graphcool-metrics'

interface Props {
  params: any
  project: Project
  children: JSX.Element
  location: any
}

class PermissionsView extends React.Component<Props, null> {
  componentDidMount() {
    tracker.track(ConsoleEvents.Permissions.viewed())
  }
  render() {
    const { project, params, location } = this.props
    return (
      <div className={cx($p.flex, $p.flexColumn, $p.bgBlack04)}>
        <Helmet title="Permissions" />
        <PermissionsHeader params={params} location={location} />
        {this.props.children &&
          React.cloneElement(this.props.children, { params, project })}
      </div>
    )
  }
}
// {activeTab === 0 && (
//   <PermissionsList params={params} project={project} />
// )}
// {activeTab === 1 && (
//   <AllRelationPermissionsList params={params} project={project} />
// )}

const MappedPermissionsView = mapProps({
  project: props => props.viewer.project,
})(PermissionsView)

export default createFragmentContainer(MappedPermissionsView, {
  viewer: graphql`
    fragment PermissionsView_viewer on Viewer {
      project: projectByName(projectName: $projectName) {
        ...PermissionsList_project
        ...AllRelationPermissionsList_project
      }
    }
  `,
})
