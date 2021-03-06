import * as React from 'react'
import { Icon } from 'graphcool-styles'
import { ShowNotificationCallback } from '../../types/utils'
import { connect } from 'react-redux'
import { showNotification } from '../../actions/notification'
import { bindActionCreators } from 'redux'
import { onFailureShowNotification } from '../../utils/relay'
import AddPermanentAuthTokenMutation from '../../mutations/AddPermanentAuthTokenMutation'

const classes = require('./PermanentAuthTokenRow.scss')

interface Props {
  projectId: string
  showNotification: ShowNotificationCallback
}

interface State {
  newTokenName: string
}

class AddPermanentAuthTokenRow extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      newTokenName: '',
    }
  }

  render() {
    return (
      <div className={classes.root}>
        <div className={classes.content}>
          <div className={classes.name}>
            <input
              value={this.state.newTokenName}
              onChange={(e: any) =>
                this.setState({ newTokenName: e.target.value })}
              onKeyDown={this.handleKeyDown}
              placeholder={'Add new token ...'}
            />
          </div>
        </div>
        {this.state.newTokenName !== '' &&
          <Icon
            width={19}
            height={19}
            src={require('assets/new_icons/add_new.svg')}
            onClick={this.addPermanentAuthToken}
          />}
      </div>
    )
  }

  private handleKeyDown = e => {
    if (e.keyCode === 13) {
      this.addPermanentAuthToken()
    }
  }

  private addPermanentAuthToken = (): void => {
    if (!this.state.newTokenName) {
      return
    }
    AddPermanentAuthTokenMutation.commit({
      projectId: this.props.projectId,
      tokenName: this.state.newTokenName,
    })
      .then(() => this.setState({ newTokenName: '' }))
      .catch(transaction =>
        onFailureShowNotification(transaction, this.props.showNotification),
      )
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ showNotification }, dispatch)
}

export default connect(null, mapDispatchToProps)(AddPermanentAuthTokenRow)
