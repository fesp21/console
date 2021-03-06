import * as React from 'react'
import { Enum } from '../../../types/types'
import { Link } from 'found'
import { Icon, $v } from 'graphcool-styles'
import { connect } from 'react-redux'
import { nextStep } from '../../../actions/gettingStarted'
import { GettingStartedState } from '../../../types/gettingStarted'
import { showNotification } from '../../../actions/notification'
import { ShowNotificationCallback } from '../../../types/utils'
import { withRouter } from 'found'
import EnumEditor from './EnumEditor'

interface Props {
  projectName: string
  enumValue: Enum
  extended: boolean
  onEditEnum: (enumValue: Enum) => void
  nextStep: () => void
  gettingStartedState: GettingStartedState
  highlighted?: boolean
  showNotification: ShowNotificationCallback
  router: any
}

interface State {
  extended?: boolean
  greenBackground: boolean
  enumName: string
  values: string[]
}

class EnumBox extends React.Component<Props, State> {
  ref: any
  constructor(props: Props) {
    super(props)

    this.state = {
      extended: undefined,
      greenBackground: Boolean(props.highlighted),
      enumName: props.enumValue.name,
      values: props.enumValue.values,
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.extended !== nextProps.extended) {
      this.setState({ extended: undefined } as State)
    }
  }
  componentDidMount() {
    this.scrollIntoView()
    setTimeout(() => {
      this.setState({ greenBackground: false } as State)
    }, 2500)
  }
  componentDidUpdate() {
    this.scrollIntoView()
  }
  scrollIntoView() {
    if (typeof this.props.highlighted === 'boolean' && this.props.highlighted) {
      setTimeout(() => {
        this.ref.scrollIntoView()
      }, 100)
    }
  }
  render() {
    const { enumValue, projectName } = this.props
    return (
      <div
        className={
          'enum-box' + (this.state.greenBackground ? ' highlighted' : '')
        }
        ref={ref => (this.ref = ref)}
      >
        <style jsx>{`
          .enum-box {
            @p: .br2, .bgWhite, .mb16, .relative, .w100;
            box-shadow: 0 1px 10px $gray30;
            transition: .1s linear all;
          }
          .enum-box:first-child {
            @p: .mt16;
          }
          .enum-box.highlighted {
            background-color: #e9f9ec;
          }
          .enum-box-head {
            @p: .flex,
              .itemsCenter,
              .bb,
              .bBlack10,
              .relative,
              .justifyBetween,
              .cbox;
            height: 65px;
          }
          .enum-box-head.extended {
            @p: .pb10;
          }
          .flexy {
            @p: .flex, .itemsCenter;
          }
          .enum-box-body.extended {
            @p: .mt16;
          }
          .title {
            @p: .ml12, .flex, .itemsCenter;
          }
          .enum-name {
            @p: .f20, .fw6, .black80, .pointer;
            letter-spacing: 0.53px;
          }
          .extend-button {
            @p: .bgLightOrange,
              .br2,
              .relative,
              .flex,
              .itemsCenter,
              .justifyCenter,
              .pointer;
            left: -4px;
            width: 16px;
            height: 16px;
          }
          .extend-button :global(i) {
            @p: .o0;
          }
          .enum-box-head:hover .extend-button :global(i) {
            @p: .o100;
          }
          .flat-field-list {
            @p: .black60, .fw6, .f14, .pa16;
          }
          .big-field-list {
            @p: .w100;
          }
          .add-button {
            @p: .bgWhite,
              .relative,
              .br2,
              .buttonShadow,
              .black60,
              .ttu,
              .fw6,
              .f12,
              .pa6,
              .flex,
              .ml10,
              .pointer;
            :global(i) {
            }
            span {
              @p: .ml4;
            }
          }
          .add-button :global(i) {
            @p: .o30;
          }
          .add-button:hover {
            @p: .blue;
          }
          .add-button:hover :global(svg) {
            stroke: $blue !important;
          }
          .add-buttons {
            @p: .absolute, .flex;
            left: -14px;
            margin-top: -16px;
          }
          .setting {
            @p: .pv10, .ph16, .flex, .itemsCenter;
            .text {
              @p: .ml10, .f14, .fw6, .black60, .ttu;
            }
          }
          .flexy :global(.simple-button) {
            @p: .mr16, .pa6, .flex, .itemsCenter;
          }
          .flexy :global(.simple-button) span {
            @p: .ml6, .ttu, .black30, .fw6, .f14;
          }
          .flexy :global(.simple-button:hover) span {
            @p: .black50;
          }
          .flexy :global(.simple-button:hover) :global(svg) {
            fill: $gray50 !important;
          }
          .system-tag {
            @p: .bgBlack04,
              .br2,
              .black40,
              .dib,
              .ml12,
              .f12,
              .flex,
              .itemsCenter,
              .ph4,
              .ttu,
              .fw6;
          }
          a.underline {
            @p: .underline;
          }
          .enum-box :global(.settings) {
            @p: .pt25, .pb25, .pr25, .pl10;
          }
          .enum-box :global(.settings:hover) :global(svg) {
            fill: $gray50;
          }
          .enum-box-head :global(.lock) {
            @p: .ml6;
            opacity: 0.75;
          }
          .enum-box-body {
            @p: .pa16, .flex, .itemsCenter;
          }
          .value {
            @p: .br2,
              .pv6,
              .ph10,
              .mr6,
              .black60,
              .fw6,
              .f14,
              .bgBlack10,
              .pointer;
          }
          .value:hover {
            @p: .bgBlack20, .black70;
          }
          .plus {
            @p: .bgBlue20,
              .flex,
              .itemsCenter,
              .justifyCenter,
              .br100,
              .ml10,
              .pointer;
            height: 26px;
            width: 26px;
          }
        `}</style>
        <div className="enum-box-head">
          <div className="flexy">
            <div className="extend-button" onClick={this.toggleExtended}>
              <Icon
                src={require('graphcool-styles/icons/stroke/arrowDown.svg')}
                stroke
                color={$v.white}
                strokeWidth={4}
                rotate={0}
                height={16}
                width={16}
              />
            </div>
            <div className="title">
              <div className="enum-name">
                {enumValue.name}
              </div>
            </div>
          </div>
          <div className="flexy">
            <Link
              className="settings"
              to={`/${projectName}/schema/enums/edit/${enumValue.name}`}
            >
              <Icon
                src={require('graphcool-styles/icons/fill/settings.svg')}
                color={$v.gray20}
              />
            </Link>
          </div>
        </div>
        <div className="enum-box-body">
          <EnumEditor
            onChange={this.handleValuesChange}
            enums={this.state.values}
            readOnly
          />
        </div>
      </div>
    )
  }

  private handleValuesChange = (values: string[]) => {
    this.setState({ values } as State)
  }

  private toggleExtended = () => {
    this.setState(({ extended, ...rest }) => {
      const newExtended =
        typeof extended === 'boolean' ? !extended : !this.props.extended
      return {
        ...rest,
        extended: newExtended,
      }
    })
  }
}

const ConnectedEnumBox = connect(
  state => {
    return {
      gettingStartedState: state.gettingStarted.gettingStartedState,
    }
  },
  { nextStep, showNotification },
)(withRouter(EnumBox))

export default ConnectedEnumBox
