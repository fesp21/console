import * as React from 'react'
import { Icon } from 'graphcool-styles'
import { PricingPlan } from '../../../types/types'
import { todayString } from '../../../utils/utils'
import { billingInfo } from './billing_info'

interface Props {
  plan: PricingPlan
  usedStoragePerDay?: number[]
  additionalCosts: number
}

export default class NodeUsageIndicator extends React.Component<Props, {}> {
  maxNodeLineY = 100

  render() {
    const columnHeights = this.calculateColumnHeights()
    const today = todayString()
    const maxMB = billingInfo[this.props.plan].maxStorage
    const maxStorageString =
      maxMB >= 1000 ? maxMB / 1000 + ' GB' : maxMB + ' MB'
    const maxString =
      '/ ' + maxStorageString + ' Database (Date: ' + today + ')'
    const color = this.barColor(1)
    let usageMB: number | string = this.props.usedStoragePerDay[
      this.props.usedStoragePerDay.length - 1
    ]
    usageMB = usageMB && !isNaN(usageMB) ? usageMB.toFixed(1) : 0

    return (
      <div className="flex flexColumn">
        <div className="bt bBlack05 w100 mv38" />
        <style jsx={true}>{`
          .title {
            @p: .black30, .fw6, .f14;
          }
          .columns {
            @p: .flex, .itemsEnd, .relative;
            height: 100px;
          }

          .column {
            @p: .br2, .mr4, .bb;
            width: 20px;
          }

          .circularTodayIndicator {
            @p: .br100, .hS06, .wS06, .mt4, .mr4;
            margin-bottom: -10px;
          }
        `}</style>
        <div className="title">Storage Usage</div>
        <div className="columns">
          {columnHeights.map((height, i) => {
            if (i === columnHeights.length - 1) {
              return (
                <div key={i} className="flex flexColumn itemsCenter">
                  {this.generateColumn(height, i)}
                  <div
                    className="circularTodayIndicator"
                    style={{ backgroundColor: color }}
                  />
                </div>
              )
            }
            return this.generateColumn(height, i)
          })}
        </div>
        <div className="flex itemsCenter justifyBetween mt25">
          <div className="flex itemsCenter">
            <Icon src={this.icon()} width={20} height={20} />
            <div className={`ml6 f14 fw6`} style={{ color }}>
              {usageMB} MB
            </div>
            <div className="ml6 black50 f14">
              {maxString}
            </div>
          </div>
          {this.props.additionalCosts > 0 &&
            <div className="f14 fw6 blue">
              {'+ $' + this.props.additionalCosts.toFixed(2)}
            </div>}
        </div>
      </div>
    )
  }

  private calculateColumnHeights = (): number[] => {
    const maxMB = billingInfo[this.props.plan].maxStorage
    const heights = this.props.usedStoragePerDay.map(usage => {
      const currentValue = usage / maxMB
      return Math.ceil(currentValue * this.maxNodeLineY)
    })
    return heights
  }

  private barColor = (opacity: number) => {
    if (this.props.plan.includes('free')) {
      const maxStorage = billingInfo[this.props.plan].maxStorage
      const warningThreshold = maxStorage - 25
      const currentlyUsedStorage = this.props.usedStoragePerDay[
        this.props.usedStoragePerDay.length - 1
      ]
      if (currentlyUsedStorage > maxStorage) {
        return `rgba(242,92,84,${opacity})`
      } else if (currentlyUsedStorage > warningThreshold) {
        return `rgba(207,92,54,${opacity})`
      } else {
        return `rgba(39,174,96,${opacity})`
      }
    }
    return `rgba(42,126,210,${opacity})`
  }

  private icon = () => {
    if (this.props.plan.includes('free')) {
      const maxStorage = billingInfo[this.props.plan].maxStorage
      const warningThreshold = maxStorage - 25
      const currentlyUsedStorage = this.props.usedStoragePerDay[
        this.props.usedStoragePerDay.length - 1
      ]
      if (currentlyUsedStorage > maxStorage) {
        return require('../../../assets/icons/nodes_red.svg')
      } else if (currentlyUsedStorage > warningThreshold) {
        return require('../../../assets/icons/nodes_orange.svg')
      } else {
        return require('../../../assets/icons/nodes_green.svg')
      }
    }
    return require('../../../assets/icons/nodes_blue.svg')
  }

  private generateColumn = (height: number, index: number) => {
    if (height > 100) {
      const maxHeight = 150
      height = height > maxHeight ? maxHeight : height

      const x = height / 100
      const offset = 100 / x

      return (
        <div
          className="column"
          style={{
            height: height + 'px',
            borderColor: this.barColor(1),
            background: `linear-gradient(to top,
              ${this.barColor(1)} 0%,
              ${this.barColor(1)} ${offset}%,
              ${this.barColor(0.1)} 100%)`,
          }}
          key={index}
        >
          <style jsx={true}>{`
            .column {
              @p: .br2, .mr4, .bb;
              width: 20px;
            }
          `}</style>
        </div>
      )
    }

    return (
      <div
        className="column"
        style={{
          height: height + 'px',
          backgroundColor: this.barColor(1),
          borderColor: this.barColor(1),
        }}
        key={index}
      >
        <style jsx={true}>{`
          .column {
            @p: .br2, .mr4, .bb;
            width: 20px;
          }
        `}</style>
      </div>
    )
  }
}
