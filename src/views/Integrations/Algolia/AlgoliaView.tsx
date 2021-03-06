import * as React from 'react'
import Helmet from 'react-helmet'
import { createFragmentContainer, graphql } from 'react-relay'
import {
  Viewer,
  SearchProviderAlgolia,
  AlgoliaSyncQuery,
  Project,
} from '../../../types/types'
import { withRouter } from 'found'
import mapProps from '../../../components/MapProps/MapProps'
import UpdateSearchProviderAlgolia from '../../../mutations/UpdateSearchProviderAlgolia'
import { connect } from 'react-redux'
import { showNotification } from '../../../actions/notification'
import { onFailureShowNotification } from '../../../utils/relay'
import { ShowNotificationCallback } from '../../../types/utils'
import AlgoliaHeader from './AlgoliaHeader'
import AlgoliaIndexes from './AlgoliaIndexes'
import AlgoliaQueryEditor from './AlgoliaQueryEditor'
import CreateAlgoliaIndex from './CreateAlgoliaIndex'
import DeleteAlgoliaSyncQueryMutation from '../../../mutations/DeleteAlgoliaSyncQueryMutation'
import UpdateAlgoliaSyncQueryMutation from '../../../mutations/UpdateAlgoliaSyncQueryMutation'
import AlgoliaModal from './AlgoliaModal'

interface Props {
  viewer: Viewer
  params: any
  router: InjectedFoundRouter
  algolia: SearchProviderAlgolia
  projectId: string
  showNotification: ShowNotificationCallback
  relay: any
  indexes: AlgoliaSyncQuery[]
  project: Project
}

interface State {
  valid: boolean
  apiKey: string
  applicationId: string
  isEnabled: boolean
  selectedIndexIndex: number
  currentFragment: string
  fragmentValid: boolean
  editing: boolean
  showNewIndex: boolean
  showModal: boolean
}

class AlgoliaView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const { algolia: { apiKey, applicationId, isEnabled }, indexes } = props

    this.state = {
      valid: false,
      apiKey,
      applicationId,
      isEnabled,
      selectedIndexIndex: 0,
      currentFragment: (indexes[0] && indexes[0].fragment) || '',
      editing: indexes.length > 0,
      showNewIndex: false,
      fragmentValid: true,
      showModal: applicationId.length === 0 && apiKey.length === 0,
    }
  }
  render() {
    const { algolia, params, project } = this.props
    const {
      selectedIndexIndex,
      showNewIndex,
      fragmentValid,
      applicationId,
      apiKey,
      showModal,
    } = this.state
    const indexes = algolia.algoliaSyncQueries.edges.map(edge => edge.node)

    return (
      <div className="algolia-view">
        <Helmet title="Algolia Integration" />
        <style jsx>{`
          .algolia-view {
            @p: .flex;
          }
          .col {
            @p: .flex1;
          }
          .button {
            @p: .pointer, .dib, .mt38;
            padding: 9px 16px 10px 16px;
          }
          .green {
            @p: .bgGreen, .white, .br2;
          }
          .intro {
            @p: .flex, .justifyCenter, .w100, .h100, .pa38, .itemsStart;
            h1,
            h2 {
              @p: .tc;
            }
            h1 {
              @p: .f25, .fw3;
            }
            h2 {
              @p: .black40, .f14, .mt25, .fw4;
            }
          }
          .inner-intro {
            @p: .flex, .justifyCenter, .itemsCenter, .flexColumn, .mt16;
          }
        `}</style>
        <div className="col">
          <AlgoliaHeader
            onAddIndex={this.handleShowNewIndex}
            onOpenModal={this.handleOpenModal}
            params={this.props.params}
          />
          {indexes.length > 0
            ? <AlgoliaIndexes
                indexes={indexes}
                params={params}
                onSelectIndex={this.handleIndexSelection}
                selectedIndexIndex={selectedIndexIndex}
              />
            : <div className="intro" />}
        </div>
        <div className="col">
          {indexes.length > 0 && !showNewIndex
            ? <AlgoliaQueryEditor
                algolia={algolia}
                onFragmentChange={this.handleFragmentChange}
                fragmentChanged={
                  this.state.currentFragment !==
                  indexes[selectedIndexIndex].fragment
                }
                fragment={this.state.currentFragment}
                selectedModel={
                  indexes[selectedIndexIndex] &&
                  indexes[selectedIndexIndex].model
                }
                onCancel={this.handleUpdateCancel}
                onUpdate={this.updateIndex}
                onDelete={this.delete}
                fragmentValid={fragmentValid}
              />
            : <CreateAlgoliaIndex
                algolia={algolia}
                project={project}
                onRequestClose={this.handleCloseNewIndex}
                noIndeces={indexes.length === 0}
              />}
        </div>
        {showModal &&
          <AlgoliaModal
            apiKey={apiKey}
            applicationId={applicationId}
            onChangeApiKey={this.handleChangeApiKey}
            onChangeApplicationId={this.handleApplicationId}
            onRequestClose={this.handleCloseModal}
            onSave={this.update}
          />}
      </div>
    )
  }

  private handleOpenModal = () => {
    this.setState(
      {
        showModal: true,
      } as State,
    )
  }

  private handleCloseModal = () => {
    if (this.state.applicationId === '' && this.state.apiKey === '') {
      return this.close()
    }
    this.setState(
      {
        showModal: false,
      } as State,
    )
  }

  private handleChangeApiKey = (e: any) => {
    this.setState(
      {
        apiKey: e.target.value,
      } as State,
    )
  }

  private handleApplicationId = (e: any) => {
    this.setState(
      {
        applicationId: e.target.value,
      } as State,
    )
  }

  private handleUpdateCancel = () => {
    const { indexes } = this.props
    const { selectedIndexIndex } = this.state
    const node = indexes[selectedIndexIndex]

    this.setState(
      {
        currentFragment: node.fragment,
      } as State,
    )
  }

  private handleCloseNewIndex = () => {
    this.setState(
      {
        showNewIndex: false,
      } as State,
    )
  }

  private handleShowNewIndex = () => {
    this.setState(
      {
        showNewIndex: true,
      } as State,
    )
  }

  private handleFragmentChange = (fragment: string, fragmentValid: boolean) => {
    this.setState(
      {
        currentFragment: fragment,
        fragmentValid,
      } as State,
    )
  }

  private handleIndexSelection = (i: number) => {
    const { indexes } = this.props
    this.setState(
      {
        selectedIndexIndex: i,
        currentFragment: indexes[i].fragment,
      } as State,
    )
  }

  private close = () => {
    const { router, params: { projectName } } = this.props
    router.push(`/${projectName}/integrations`)
  }

  private updateIndex = () => {
    const { indexes } = this.props
    const { currentFragment, selectedIndexIndex } = this.state
    const node = indexes[selectedIndexIndex]

    if (!this.indexValid()) {
      showNotification({
        message: 'The search query is not valid',
        level: 'error',
      })
      return
    }

    if (this.indexValid() && node) {
      UpdateAlgoliaSyncQueryMutation.commit({
        algoliaSyncQueryId: node.id,
        fragment: currentFragment,
        isEnabled: true,
        indexName: node.indexName,
      })
        .then(transaction => {
          this.props.showNotification({
            message: 'Index updated',
            level: 'success',
          })
        })
        .catch(transaction => {
          onFailureShowNotification(transaction, this.props.showNotification)
        })
    }
  }

  private indexValid() {
    return this.state.fragmentValid
  }

  private update = () => {
    const { apiKey, applicationId } = this.state
    const { algolia, projectId } = this.props
    UpdateSearchProviderAlgolia.commit({
      id: algolia.id,
      isEnabled: true,
      apiKey,
      applicationId,
      projectId,
    })
      .then(transaction => {
        this.handleCloseModal()
      })
      .catch(transaction => {
        onFailureShowNotification(transaction, this.props.showNotification)
      })
  }

  private delete = () => {
    const { algolia, indexes } = this.props
    const { selectedIndexIndex } = this.state

    const node = indexes[selectedIndexIndex]

    if (node) {
      DeleteAlgoliaSyncQueryMutation.commit({
        algoliaSyncQueryId: node.id,
        searchProviderAlgoliaId: algolia.id,
      })
    }

    if (selectedIndexIndex > 0) {
      this.setState(
        {
          selectedIndexIndex: selectedIndexIndex - 1,
        } as State,
      )
    }
  }
}

const ReduxContainer = connect(null, {
  showNotification,
})(AlgoliaView)

const MappedAlgoliaPopup = mapProps({
  projectId: props => props.viewer.project.id,
  project: props => props.viewer.project,
  algolia: props => {
    const algolias = props.viewer.project.integrations.edges.filter(
      edge => edge.node.type === 'SEARCH_PROVIDER',
    )
    if (algolias.length > 0) {
      return algolias[0].node
    }

    return null
  },
  indexes: props => {
    let algolia: any
    const algolias = props.viewer.project.integrations.edges.filter(
      edge => edge.node.type === 'SEARCH_PROVIDER',
    )
    if (algolias.length > 0) {
      algolia = algolias[0].node
      return algolia.algoliaSyncQueries.edges.map(edge => edge.node)
    } else {
      return []
    }
  },
})(ReduxContainer)

export default createFragmentContainer(withRouter(MappedAlgoliaPopup), {
  viewer: graphql`
    fragment AlgoliaView_viewer on Viewer {
      project: projectByName(projectName: $projectName) {
        id
        ...CreateAlgoliaIndex_project
        integrations(first: 1000) {
          edges {
            node {
              id
              name
              type
              ... on SearchProviderAlgolia {
                ...CreateAlgoliaIndex_algolia
                ...AlgoliaQueryEditor_algolia
                id
                isEnabled
                apiKey
                applicationId
                algoliaSyncQueries(first: 1000) {
                  edges {
                    node {
                      id
                      fragment
                      indexName
                      isEnabled
                      model {
                        itemCount
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
})
