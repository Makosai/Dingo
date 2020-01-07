interface UserFollows {
  data: [
    {
      from_id: string;
      from_name: string;
      to_id: string;
      to_name: string;
      followed_at: string | Date;
    }
  ];
}

interface StreamChanged {
  data: [
    {
      id: string;
      user_id: string;
      user_name: string;
      game_id: string;
      community_ids: [];
      type: string;
      title: string;
      viewer_count: number;
      started_at: string | Date;
      language: string;
      thumbnail_url: string;
    }
  ];
}

interface UserChanged {
  data: [
    {
      id: string;
      login: string;
      display_name: string;
      type: string;
      broadcaster_type: string;
      description: string;
      profile_image_url: string;
      offline_image_url: string;
      view_count: number;
    }
  ];
}

interface ExtensionTransactionCreated {
  data: [
    {
      broadcaster_id: string;
      broadcaster_name: string;
      id: string;
      product_data: {
        cost: {
          amount: number;
          type: string;
        };
        broadcast: boolean;
        displayName: string;
        domain: string;
        expiration: string;
        inDevelopment: boolean;
        sku: string;
      };
      product_type: string;
      timestamp: string  | Date;
      user_id: string;
      user_name: string;
    }
  ];
}

interface ModeratorChangeEvent {
  data: [
    {
      id: string;
      event_type: string;
      event_timestamp: string  | Date;
      version: string;
      event_data: {
        broadcaster_id: string;
        broadcaster_name: string;
        user_id: string;
        user_name: string;
      };
    }
  ];
}

interface ChannelBanChangeEvent {
  data: [
    {
      id: string;
      event_type: string;
      event_timestamp: string  | Date;
      version: string;
      event_data: {
        broadcaster_id: string;
        broadcaster_name: string;
        user_id: string;
        user_name: string;
      };
    }
  ];
}

interface SubscriptionEvents {
  data: [
    {
      id: string;
      event_type: string;
      event_timestamp: string  | Date;
      version: string;
      event_data: {
        broadcaster_id: string;
        broadcaster_name: string;
        is_gift: boolean;
        plan_name: string;
        tier: string;
        user_id: string;
        user_name: string;
        message?: string;
      };
    }
  ];
}
