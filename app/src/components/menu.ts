import { Menu, clipboard, shell, MenuItemConstructorOptions } from 'electron';

export function createMenu({
  nativefierVersion,
  appQuit,
  zoomIn,
  zoomOut,
  zoomReset,
  zoomBuildTimeValue,
  goBack,
  goForward,
  getCurrentUrl,
  clearAppData,
  disableDevTools,
}): void {
  const zoomResetLabel =
    zoomBuildTimeValue === 1.0
      ? 'Zurücksetzen'
      : `Zurücksetzen (auf ${zoomBuildTimeValue * 100}%, als Standard gesetzt)`;

  const editMenu: MenuItemConstructorOptions = {
    label: '&Bearbeiten',
    submenu: [
      {
        label: 'Rückgängig',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo',
      },
      {
        label: 'Wiederholen',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: 'Ausschneiden',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut',
      },
      {
        label: 'Kopieren',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy',
      },
      {
        label: 'Kopiere aktuelle URL',
        accelerator: 'Shift+CmdOrCtrl+C',
        click: () => {
          const currentURL = getCurrentUrl();
          clipboard.writeText(currentURL);
        },
      },
      {
        label: 'Einfügen',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
      },
      {
        label: 'Einfügen und Stil anpassen',
        accelerator: 'CmdOrCtrl+Shift+V',
        role: 'pasteAndMatchStyle',
      },
      {
        label: 'Alles auswählen',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectAll',
      },
      {
        label: 'Lösche App Daten',
        click: clearAppData,
      },
    ],
  };

  const viewMenu: MenuItemConstructorOptions = {
    label: '&Ansicht',
    submenu: [
      {
        label: 'Zurück',
        accelerator: (() => {
          const backKbShortcut =
            process.platform === 'darwin' ? 'Cmd+Left' : 'Alt+Left';
          return backKbShortcut;
        })(),
        click: goBack,
      },
      {
        label: 'BackAdditionalShortcut',
        visible: false,
        acceleratorWorksWhenHidden: true,
        accelerator: 'CmdOrCtrl+[', // What old versions of Nativefier used, kept for backwards compat
        click: goBack,
      },
      {
        label: 'Vor',
        accelerator: (() => {
          const forwardKbShortcut =
            process.platform === 'darwin' ? 'Cmd+Right' : 'Alt+Right';
          return forwardKbShortcut;
        })(),
        click: goForward,
      },
      {
        label: 'ForwardAdditionalShortcut',
        visible: false,
        acceleratorWorksWhenHidden: true,
        accelerator: 'CmdOrCtrl+]', // What old versions of Nativefier used, kept for backwards compat
        click: goForward,
      },
      {
        label: 'Aktualisieren',
        accelerator: 'F5',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Vollbildansicht',
        accelerator: (() => {
          if (process.platform === 'darwin') {
            return 'Ctrl+Cmd+F';
          }
          return 'F11';
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        },
      },
      {
        label: 'Vergrößern',
        accelerator: 'CmdOrCtrl+=',
        click: zoomIn,
      },
      {
        label: 'ZoomInAdditionalShortcut',
        visible: false,
        acceleratorWorksWhenHidden: true,
        accelerator: 'CmdOrCtrl+numadd',
        click: zoomIn,
      },
      {
        label: 'Verkleinern',
        accelerator: 'CmdOrCtrl+-',
        click: zoomOut,
      },
      {
        label: 'ZoomOutAdditionalShortcut',
        visible: false,
        acceleratorWorksWhenHidden: true,
        accelerator: 'CmdOrCtrl+numsub',
        click: zoomOut,
      },
      {
        label: zoomResetLabel,
        accelerator: 'CmdOrCtrl+0',
        click: zoomReset,
      },
      {
        label: 'ZoomResetAdditionalShortcut',
        visible: false,
        acceleratorWorksWhenHidden: true,
        accelerator: 'CmdOrCtrl+num0',
        click: zoomReset,
      },
    ],
  };

  if (!disableDevTools) {
    (viewMenu.submenu as MenuItemConstructorOptions[]).push(
      {
        type: 'separator',
      },
      {
        label: 'Entwicklerwerkzeuge ein-/ausblenden',
        accelerator: (() => {
          if (process.platform === 'darwin') {
            return 'Alt+Cmd+I';
          }
          return 'Ctrl+Shift+I';
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.webContents.toggleDevTools();
          }
        },
      },
    );
  }

  const windowMenu: MenuItemConstructorOptions = {
    label: '&Fenster',
    role: 'window',
    submenu: [
      {
        label: 'Minimieren',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize',
      },
      {
        label: 'Schließen',
        accelerator: 'CmdOrCtrl+Q',
        role: 'close',
      },
    ],
  };

  const helpMenu: MenuItemConstructorOptions = {
    label: '&Hilfe',
    role: 'help',
    submenu: [
      {
        label: `Erstellt mit Nativefier v${nativefierVersion}`,
        click: () => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          shell.openExternal('https://github.com/jiahaog/nativefier');
        },
      },
      {
        label: 'Ein Problem melden',
        click: () => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          shell.openExternal('https://github.com/jiahaog/nativefier/issues');
        },
      },
    ],
  };

  let menuTemplate: MenuItemConstructorOptions[];

  if (process.platform === 'darwin') {
    const electronMenu: MenuItemConstructorOptions = {
      label: 'E&lectron',
      submenu: [
        {
          label: 'Services',
          role: 'services',
          submenu: [],
        },
        {
          type: 'separator',
        },
        {
          label: 'Hide App',
          accelerator: 'Cmd+H',
          role: 'hide',
        },
        {
          label: 'Hide Others',
          accelerator: 'Cmd+Shift+H',
          role: 'hideOthers',
        },
        {
          label: 'Show All',
          role: 'unhide',
        },
        {
          type: 'separator',
        },
        {
          label: 'Quit',
          accelerator: 'Cmd+Q',
          click: appQuit,
        },
      ],
    };
    (windowMenu.submenu as MenuItemConstructorOptions[]).push(
      {
        type: 'separator',
      },
      {
        label: 'Bring All to Front',
        role: 'front',
      },
    );
    menuTemplate = [electronMenu, editMenu, viewMenu, windowMenu, helpMenu];
  } else {
    menuTemplate = [editMenu, viewMenu, windowMenu, helpMenu];
  }

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}
