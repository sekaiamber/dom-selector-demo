import rangy from 'rangy'
import 'rangy/lib/rangy-serializer'
import BaseSelector, { SelectRange } from './base'

function unwrap(wrapper: HTMLElement): void {
  const docFrag = document.createDocumentFragment()
  while (wrapper.firstChild) {
    const child = wrapper.removeChild(wrapper.firstChild)
    docFrag.appendChild(child)
  }

  const parentNode = wrapper.parentNode
  if (!parentNode) return
  parentNode.replaceChild(docFrag, wrapper)
}

export default class TextSpanSelector extends BaseSelector {
  protected readonly wrapperClassName = 'wrapper-' + this.uuid()

  protected renderTag(rangeObj: SelectRange, range: Range): void {
    const el = document.createElement('span')
    el.className = this.wrapperClassName
    el.id = rangeObj.id
    range.surroundContents(el)
  }

  handleBeforeInitIFrame(): void {
    const iframe = this.iframe
    if (!iframe.contentWindow || !iframe.contentDocument) return
    const style = iframe.contentDocument.createElement('style')
    style.innerHTML = `.${this.wrapperClassName} { background-color: yellow; }`
    iframe.contentDocument.getElementsByTagName('head')[0].appendChild(style)
  }

  handleSelectContent(range: Range): SelectRange {
    const range2 = rangy.getSelection(this.iframe).getRangeAt(0)
    const path = (rangy as any).serializeRange(
      range2,
      true,
      this.iframe.contentDocument?.rootElement
    )
    const rangeObj: SelectRange = {
      id: this.uuid(),
      text: range.toString(),
      path,
    }
    this.renderTag(rangeObj, range)
    return rangeObj
  }

  handleDeleteRangeById(id: string): void {
    const iframe = this.iframe
    if (!iframe.contentDocument) return
    const dom = iframe.contentDocument.getElementById(id)
    if (!dom) return
    unwrap(dom)
  }

  handleRestore(ranges: SelectRange[]): void {
    const newRanges: SelectRange[] = []
    ranges.forEach((rangeObj) => {
      try {
        const range2 = (rangy as any).deserializeRange(
          rangeObj.path,
          this.iframe.contentDocument?.rootElement,
          this.iframe.contentDocument
        )
        const range = range2.nativeRange as Range
        this.renderTag(rangeObj, range)
        newRanges.push(rangeObj)
      } catch (error) {
        console.log(`id: ${rangeObj.id} 恢复失败`)
        console.log(error)
      }
    })
    this.ranges = newRanges
  }
}
