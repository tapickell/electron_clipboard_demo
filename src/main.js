const {app, clipboard, BrowserWindow, Menu, Tray, globalShortcut } = require('electron')
const path = require('path')

const STACK_SIZE = 5
const ITEM_MAX_LENGTH = 20

function addToStack(item, stack) {
  return [item].concat(stack.length >= STACK_SIZE ? stack.slice(0, stack.length - 1) : stack)
}

function checkClipboardForChange(clipboard, onChange) {
  let cache = clipboard.readText()
  let latest
  setInterval(_ => {
    latest = clipboard.readText()
    if (latest !== cache) {
      cache = latest
        onChange(cache)
    }
  }, 1000)
}

function formatItem(item) {
  return item && item.length > ITEM_MAX_LENGTH
    ? item.substr(0, ITEM_MAX_LENGTH) + '...'
    : item
}
function formatMenuTemplateForStack(clipboard, stack) {
  return stack.map((item, i) => {
    return {
      label: `Copy ${formatItem(item)}`,
      click: _ => clipboard.writeText(item)
    }
  })
}

app.on('ready', _ => {
  console.log("in ready state")
  globalShortcut.register('CommandOrControl+Q', _ => { app.quit() })
  const tray = new Tray(path.join('src', 'space_ghost.png'))
  const menu = Menu.buildFromTemplate([
      {
        label: 'Awesome',
        click: _ => console.log('Awsome Clicked')
      }, {
        label: '<Empty>',
        enabled: false
      }
  ])
  tray.setContextMenu(menu)
  tray.setToolTip('This app rocks')

  let stack = []

  checkClipboardForChange(clipboard, text => {
    stack = addToStack(text, stack)
    console.log("stack", stack)
    tray.setContextMenu(Menu.buildFromTemplate(formatMenuTemplateForStack(clipboard, stack)))
  })

  //new BrowserWindow()
})

