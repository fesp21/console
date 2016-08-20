import * as React from 'react'
import * as Relay from 'react-relay'
import {PermanentAuthToken} from '../../types/types'
import Icon from '../../components/Icon/Icon'
import DeletePermanentAuthTokenMutation from '../../mutations/DeletePermanentAuthTokenMutation'
import {ShowNotificationCallback} from '../../types/utils'
import CopyToClipboard from 'react-copy-to-clipboard'
import {onFailureShowNotification} from '../../utils/relay'

const classes = require('./PermanentAuthTokenRow.scss')

interface Props {
  permanentAuthToken: PermanentAuthToken
  projectId: string
}

interface State {
  showFullToken: boolean
  isCopied: boolean
}

class PermanentAuthTokenRow extends React.Component<Props, State> {

  static contextTypes = {
    showNotification: React.PropTypes.func.isRequired,
  }

  context: {
    showNotification: ShowNotificationCallback
  }

  constructor(props) {
    super(props)

    this.state = {
      showFullToken: false,
      isCopied: false,
    }
  }

  render() {

    return (
      <CopyToClipboard
        text={this.props.permanentAuthToken.token}
        onCopy={() => this.setState({isCopied: true} as State)}
      >
        <div
          className={classes.root}
          onMouseEnter={() => this.setState({showFullToken: true} as State)}
          onMouseLeave={() => this.setState({showFullToken: false} as State)}
        >
          <div className={classes.content}>
            <div className={classes.name}>
              {this.props.permanentAuthToken.name}
              {this.state.showFullToken &&
                <span className={classes.hint}>
                  {this.state.isCopied ? '(copied)' : '(click to copy)'}
                </span>
              }
            </div>
            <div className={classes.token}>
              {this.state.showFullToken ? this.props.permanentAuthToken.token : this.getTokenSuffix()}
            </div>
          </div>
          <Icon
            width={19}
            height={19}
            src={require('assets/icons/delete.svg')}
            onClick={this.deleteSystemToken}
          />
        </div>
      </CopyToClipboard>
    )
  }

  private getTokenSuffix = (): string => {
    // Getting the suffix because that's the only part that's changing
    return this.props.permanentAuthToken.token.split('.').reverse()[0]
  }

  private deleteSystemToken = (): void => {
    Relay.Store.commitUpdate(
      new DeletePermanentAuthTokenMutation({
        projectId: this.props.projectId,
        tokenId: this.props.permanentAuthToken.id,
      }),
      {
        onFailure: (transaction) => onFailureShowNotification(transaction, this.context.showNotification),
      })
  }
}

export default Relay.createContainer(PermanentAuthTokenRow, {
  fragments: {
    permanentAuthToken: () => Relay.QL`
      fragment on SystemToken {
        id
        name
        token
      }
    `,
  },
})
