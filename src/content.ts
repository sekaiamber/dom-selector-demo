import $ from 'jquery'
import axios from 'axios'
import Selector, { SelectRange } from './selector'

const $iframe = $('#content')
const selector = new Selector($iframe[0] as HTMLIFrameElement)

async function loadContent(): Promise<void> {
  const url = $('#url input').val()
  if (!url) return
  // TODO: 获取目标html
  const resp = await axios.post('./api/v1/utils/html', { url })
  const data = resp.data
  if (data.success) {
    // TODO: 设置html
    selector.initIframe(data.data.baseUrl, data.data.document)
  }
}

function renderRanges(ranges: SelectRange[]): void {
  const $tags = $('#tags')
  $tags.empty()
  ranges.forEach((range) => {
    const $range = $(
      `<span class="range" data-text="${range.text}" data-id="${range.id}"></span>`
    )
    $tags.append($range)
    $range.on('click', () => {
      selector.deleteRange(range.id)
    })
  })
}

function saveContent(): void {
  const rs = selector.save()
  $('#save textarea').val(JSON.stringify(rs, undefined, 2))
}

function restoreContent(): void {
  const rs = JSON.parse($('#restore textarea').val() as string) as SelectRange[]
  selector.restore(rs)
}

export default function init(): void {
  $('#url button').click(loadContent)
  $('#save button').click(saveContent)
  $('#restore button').click(restoreContent)

  selector.on('rangesChange', (ranges: SelectRange[]) => {
    renderRanges(ranges)
  })
}
