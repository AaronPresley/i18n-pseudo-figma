import { FigmaMessageData, sendMsgToUI, uiMessageObserver } from '../utils/messages';
import { getValue, setValue } from '../utils/storage';

export interface StoredSettings {
  pseudoTranslate: {
    doExpand: boolean;
  }
}

const getSettings = async ():Promise<StoredSettings> => ({
  pseudoTranslate: {
    doExpand: await getValue<boolean>('pseudoTranslate.doExpand') || false,
  }
});

const saveSettings = async (settings:StoredSettings):Promise<void> => {
  await setValue(
    'pseudoTranslate.doExpand',
    settings?.pseudoTranslate?.doExpand || false,
  );
};

const processMsg = async (msg:FigmaMessageData) => {
  const data = msg?.data || null;

  console.info(`Got UI message "${msg.command}"`, msg);
  switch(msg?.command) {
    case 'settings-getSettings':
      sendMsgToUI({
        command: 'settings-getSettings',
        data: await getSettings(),
      });
      break;

    case 'settings-saveSettings':
      saveSettings(msg?.data);
      break;

    default:
      console.warn(`Unknown command from UI "${msg.command}"`)
      break;
  }
}

export default async () => {
  figma.showUI(__html__, { width: 500, height: 600 });

  // Watch for any UI messages and pass them to
  // the func responsible for processing them
  uiMessageObserver().subscribe(processMsg);

  // Triggering our UI layer to initialize our settings
  sendMsgToUI({ command: 'init-ui-settings' });
}