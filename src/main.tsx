// TS-lint disabled because otherwise React is not defined.
import * as React from 'react' // tslint:disable-line
import * as Relay from 'react-relay'
import * as ReactDOM from 'react-dom'
import { default as useRelay } from 'react-router-relay'
import { Router, browserHistory, applyRouterMiddleware } from 'react-router'
import routes from './routes'
import { updateNetworkLayer } from './utils/relay'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import { Provider } from 'react-redux'
import * as thunk from 'redux-thunk'
import * as cookiestore from 'cookiestore'
import drumstick from 'drumstick'
import { reduceGettingStartedState } from './reducers/gettingStarted'
import { fetchGettingStartedState } from './actions/gettingStarted'
import { reducePopup } from './reducers/popup'
import { reduceProgress } from './reducers/progressIndicator'
import { reduceData as reduceDataBrowserData } from './reducers/databrowser/data'
import { reduceUI as reduceDataBrowserUI } from './reducers/databrowser/ui'
import { reduceNotification } from './reducers/notification'
import { StateTree } from './types/reducers'
import logger from 'redux-logger'
import * as ReactGA from 'react-ga'

import './utils/polyfils'

if (
  __HEARTBEAT_ADDR__ &&
  cookiestore.has('graphcool_auth_token') &&
  cookiestore.has('graphcool_last_used_project_id')
) {
  drumstick.start({
    endpoint: __HEARTBEAT_ADDR__,
    payload: () => ({
      resource: 'console',
      token: cookiestore.get('graphcool_auth_token'),
      projectId: cookiestore.get('graphcool_last_used_project_id'),
    }),
    frequency: 60 * 1000,
  })
}

updateNetworkLayer()

if (__GA_CODE__) {
  ReactGA.initialize(__GA_CODE__)

  browserHistory.listen(() => {
    ReactGA.pageview(window.location.pathname)
  })
}

const reducers: StateTree = combineReducers({
  gettingStarted: reduceGettingStartedState,
  popup: reducePopup,
  progressIndicator: reduceProgress,
  notification: reduceNotification,
  databrowser: combineReducers({
    data: reduceDataBrowserData,
    ui: reduceDataBrowserUI,
  }),
})

let middlewares = [thunk.default]

if (process.env.NODE_ENV !== 'production') {
  middlewares.push(logger())
}

const store = createStore(reducers, compose(
  applyMiddleware(...middlewares),
  window.devToolsExtension ? window.devToolsExtension() : f => f
))

store.dispatch(fetchGettingStartedState())

ReactDOM.render(
  (
    <Provider store={store}>
      <Router
        forceFetch
        routes={routes}
        environment={Relay.Store}
        render={applyRouterMiddleware(useRelay)}
        history={browserHistory}
      />
    </Provider>
  ),
  document.getElementById('root')
)
