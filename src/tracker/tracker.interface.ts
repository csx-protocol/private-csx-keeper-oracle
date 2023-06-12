/* eslint-disable prettier/prettier */
enum ErrorCodes {
  ImproperParameterStructure = 1,
  InvalidInspectLinkStructure = 2,
  PendingRequestsExceeded = 3,
  ValveServersTimeout = 4,
  ValveServersOffline = 5,
  InternalError = 6,
  ImproperBodyFormat = 7,
  BadSecret = 8,
}

const ErrorMessages = {
  [ErrorCodes.ImproperParameterStructure]: 'Improper parameter structure',
  [ErrorCodes.InvalidInspectLinkStructure]: 'Invalid inspect link structure',
  [ErrorCodes.PendingRequestsExceeded]:
    'You may only have X pending request(s) at a time',
  [ErrorCodes.ValveServersTimeout]: "Valve's servers didn't reply in time",
  [ErrorCodes.ValveServersOffline]:
    "Valve's servers appear to be offline, please try again later!",
  [ErrorCodes.InternalError]:
    'Something went wrong on our end, please try again',
  [ErrorCodes.ImproperBodyFormat]: 'Improper body format',
  [ErrorCodes.BadSecret]: 'Bad Secret',
};

interface User {
  hasTrackedItem: boolean;
  fetchedTime: string;
  AllInventoryItems: InventoryResponseMerged[];
  assetIds: string[];
  [trackedItems: string]: any;
}

interface InventoryResponse {
  assets: Assets[];
  descriptions: Descriptions[];
  total_inventory_count: number;
  success: number;
  rwgrsn: number;
}

interface InventoryResponseMerged {
  actions: any[];
  tags: any[];
  descriptions: any[];
  tradable: number;
  market_hash_name: unknown;
  appid: string;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
  description: any[];
}

interface Assets {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
}

interface Descriptions {
  appid: number;
  classid: string;
  instanceid: string;
  currency: number;
  background_color: string;
  icon_url: string;
  icon_url_large: string;
  descriptions: {
    type: string;
    value: string;
    color?: string;
  }[];
  tradable: number;
  actions: {
    link: string;
    name: string;
  }[];
  name: string;
  name_color: string;
  type: string;
  market_name: string;
  market_hash_name: string;
  market_actions: {
    link: string;
    name: string;
  }[];
  commodity: number;
  market_tradable_restriction: number;
  marketable: number;
  tags: {
    category: string;
    internal_name: string;
    localized_category_name: string;
    localized_tag_name: string;
    color?: string;
  }[];
}
