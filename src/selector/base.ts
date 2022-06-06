import { customAlphabet } from 'nanoid'
import EventEmitter from 'events'

const nanoid = customAlphabet('1234567890abcdef', 10)

let tempX: number
let tempY: number

export interface SelectRange {
  id: string
  text: string
  path: string
}

export default abstract class BaseSelector extends EventEmitter {
  protected originHtml: string = ''
  protected baseUrl: string = ''
  protected _ranges: SelectRange[] = []

  protected set ranges(rs: SelectRange[]) {
    this._ranges = rs
    this.emit('rangesChange', this.ranges)
  }

  protected get ranges(): SelectRange[] {
    return this._ranges
  }

  protected uuid(): string {
    return nanoid()
  }

  constructor(protected iframe: HTMLIFrameElement) {
    super()
  }

  private renderHtml(): void {
    const iframe = this.iframe
    if (!iframe.contentWindow || !iframe.contentDocument) return
    iframe.contentWindow.document.open()
    iframe.contentWindow.document.write(this.originHtml)
    // base element
    const bt = iframe.contentDocument.createElement('base')
    bt.setAttribute('href', this.baseUrl)
    iframe.contentDocument.getElementsByTagName('head')[0].appendChild(bt)
    // style
    const style = iframe.contentDocument.createElement('style')
    style.innerHTML = 'html {overflow: hidden;}'
    iframe.contentDocument.getElementsByTagName('head')[0].appendChild(style)

    this.handleBeforeInitIFrame()

    iframe.contentWindow.document.close()

    iframe.onload = () => {
      if (!iframe.contentWindow || !iframe.contentDocument) return
      iframe.style.height = `${iframe.contentWindow.document.body.scrollHeight}px`
    }

    iframe.contentDocument.onmousedown = (e) => {
      tempX = e.screenX
      tempY = e.screenY
    }
    iframe.contentDocument.onmouseup = (e) => {
      if (!iframe.contentWindow || !iframe.contentDocument) return
      if (e.screenX !== tempX || e.screenY !== tempY) {
        const selection = iframe.contentWindow.getSelection()
        if (!selection) return
        try {
          const range = selection.getRangeAt(0)
          if (!range.toString()) return
          const rangeObj = this.handleSelectContent(range)
          this.ranges = [...this.ranges, rangeObj]
        } catch (error) {
          console.log(error)
        }
      }
    }
  }

  initIframe(baseUrl: string, html: string): void {
    this.baseUrl = baseUrl
    this.originHtml = html
    this.ranges = []
    this.renderHtml()
  }

  deleteRange(id: string): void {
    const idx = this.ranges.findIndex((r) => r.id === id)
    if (idx > -1) {
      try {
        this.handleDeleteRangeById(id)
        this.ranges.splice(idx, 1)
        this.ranges = [...this.ranges]
      } catch (error) {
        console.log(error)
      }
    }
  }

  save(): SelectRange[] {
    return this.ranges
  }

  restore(ranges: SelectRange[]): void {
    this.handleRestore(ranges)
  }

  // TODO: 实现一个初始化iframe
  protected abstract handleBeforeInitIFrame(): void
  // TODO: 实现一个selection处理
  protected abstract handleSelectContent(range: Range): SelectRange
  // TODO: 实现一个delete处理
  protected abstract handleDeleteRangeById(id: string): void
  // TODO: 实现一个restore处理
  protected abstract handleRestore(ranges: SelectRange[]): void
}
