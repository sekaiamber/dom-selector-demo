import $ from 'jquery'
import rangy from 'rangy'
import 'rangy/lib/rangy-serializer'
import BaseSelector, { SelectRange } from './base'

const $tagContainer = $('#tagContainer')

export default class RectSelector extends BaseSelector {
  protected handleBeforeInitIFrame(): void {
    $tagContainer.empty()
  }

  protected renderTag(rangeObj: SelectRange, rect: DOMRect): void {
    let $tag = $(`#${rangeObj.id}`, $tagContainer)
    if ($tag.length === 0) {
      $tag = $(`<span class="tag" id="${rangeObj.id}" style=></span>`)
      $tagContainer.append($tag)
    }
    $tag.css('left', `${rect.x}px`)
    $tag.css('top', `${rect.y}px`)
    $tag.css('width', `${rect.width}px`)
    $tag.css('height', `${rect.height}px`)
  }

  protected handleSelectContent(range: Range): SelectRange {
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
    const rect = range.getBoundingClientRect()
    this.renderTag(rangeObj, rect)
    return rangeObj
  }

  protected handleDeleteRangeById(id: string): void {
    const iframe = this.iframe
    if (!iframe.contentDocument) return
    $(`#${id}`, $tagContainer).remove()
  }

  protected handleRestore(ranges: SelectRange[]): void {
    const newRanges: SelectRange[] = []
    ranges.forEach((rangeObj) => {
      try {
        const range2 = (rangy as any).deserializeRange(
          rangeObj.path,
          this.iframe.contentDocument?.rootElement,
          this.iframe.contentDocument
        )
        const range = range2.nativeRange as Range
        const rect = range.getBoundingClientRect()
        this.renderTag(rangeObj, rect)
        newRanges.push(rangeObj)
      } catch (error) {
        console.log(`id: ${rangeObj.id} 恢复失败`)
        console.log(error)
      }
    })
    this.ranges = newRanges
  }
}
