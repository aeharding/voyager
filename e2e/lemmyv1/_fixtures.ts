// Shared v1 (Lemmy 1.0) fixtures + route mocking.
// These response shapes match `lemmy-js-client-v1` types.

import type { Page } from "@playwright/test";

export const V1_HOST = "v1.test.lemmy";

const NOW = "2026-05-21T12:00:00.000Z";

// --- nodeinfo: tells threadiverse this is a Lemmy v1 instance ---

const wellknownNodeinfo = {
  links: [
    {
      rel: "http://nodeinfo.diaspora.software/ns/schema/2.1",
      href: `https://${V1_HOST}/nodeinfo/2.1`,
    },
  ],
};

const nodeinfo21 = {
  version: "2.1",
  software: {
    name: "lemmy",
    version: "1.0.0-beta.1",
  },
};

// --- Helpers for building v1 responses ---

function person(over: { id: number; name: string; display_name?: string }) {
  return {
    id: over.id,
    name: over.name,
    display_name: over.display_name,
    ap_id: `https://${V1_HOST}/u/${over.name}`,
    published_at: NOW,
    local: true,
    deleted: false,
    bot_account: false,
    instance_id: 1,
    bio: undefined,
    banned: false,
    avatar: undefined,
    banner: undefined,
    matrix_user_id: undefined,
    post_count: 0,
    comment_count: 0,
  };
}

function community() {
  return {
    id: 111,
    name: "test_comm",
    title: "Test Community",
    description: "a community",
    sidebar: undefined,
    summary: undefined,
    ap_id: `https://${V1_HOST}/c/test_comm`,
    published_at: NOW,
    updated_at: undefined,
    last_refreshed_at: NOW,
    icon: undefined,
    banner: undefined,
    removed: false,
    deleted: false,
    nsfw: false,
    local: true,
    visibility: "public",
    posting_restricted_to_mods: false,
    instance_id: 1,
    subscribers: 1,
    posts: 1,
    comments: 0,
    users_active_day: 0,
    users_active_week: 0,
    users_active_month: 0,
    users_active_half_year: 0,
    subscribers_local: 1,
    report_count: 0,
    unresolved_report_count: 0,
    local_removed: false,
  };
}

function postView(over: {
  id: number;
  name: string;
  body?: string;
  creator: ReturnType<typeof person>;
}) {
  return {
    post: {
      id: over.id,
      name: over.name,
      body: over.body,
      creator_id: over.creator.id,
      community_id: 111,
      removed: false,
      locked: false,
      published_at: NOW,
      updated_at: undefined,
      deleted: false,
      nsfw: false,
      thumbnail_url: undefined,
      ap_id: `https://${V1_HOST}/post/${over.id}`,
      local: true,
      language_id: 0,
      featured_community: false,
      featured_local: false,
      url: undefined,
      url_content_type: undefined,
      embed_title: undefined,
      embed_description: undefined,
      embed_video_url: undefined,
      alt_text: undefined,
      newest_comment_time_at: NOW,
      comments: 0,
      score: 1,
      upvotes: 1,
      downvotes: 0,
      report_count: 0,
      unresolved_report_count: 0,
      scaled_rank: 1,
      hot_rank: 1,
      hot_rank_active: 1,
      controversy_rank: 0,
    },
    creator: over.creator,
    community: community(),
    image_details: undefined,
    community_actions: undefined,
    post_actions: undefined,
    person_actions: undefined,
    can_mod: false,
    creator_banned: false,
    creator_ban_expires_at: undefined,
    creator_is_admin: false,
    creator_is_moderator: false,
    creator_banned_from_community: false,
    creator_community_ban_expires_at: undefined,
    tags: [],
  };
}

const me = person({ id: 100, name: "alex", display_name: "alex" });
const mod = person({ id: 101, name: "themod", display_name: "TheMod" });
const bannedPerson = person({ id: 102, name: "badperson" });

export const fixturePosts = [
  postView({ id: 1, name: "First v1 post", body: "v1 body 1", creator: me }),
  postView({ id: 2, name: "Second v1 post", body: "v1 body 2", creator: me }),
  postView({ id: 3, name: "Third v1 post", body: "v1 body 3", creator: me }),
];

const siteResponse = {
  site_view: {
    site: {
      id: 1,
      name: "Test v1 site",
      sidebar: undefined,
      published_at: NOW,
      updated_at: undefined,
      icon: undefined,
      banner: undefined,
      summary: undefined,
      ap_id: `https://${V1_HOST}/`,
      inbox_url: `https://${V1_HOST}/site_inbox`,
      public_key: "",
      content_warning: undefined,
      instance_id: 1,
      last_refreshed_at: NOW,
      description: undefined,
    },
    local_site: {
      id: 1,
      site_id: 1,
      site_setup: true,
      community_creation_admin_only: false,
      email_verification_required: false,
      application_question: undefined,
      private_instance: false,
      default_theme: "browser",
      default_post_listing_type: "all",
      legal_information: undefined,
      application_email_admins: false,
      slur_filter_regex: undefined,
      federation_enabled: true,
      published_at: NOW,
      updated_at: undefined,
      registration_mode: "open",
      reports_email_admins: false,
      federation_signed_fetch: false,
      default_post_listing_mode: "List",
      default_post_sort_type: "active",
      default_comment_sort_type: "hot",
      oauth_registration: false,
      post_upvotes: "all",
      post_downvotes: "all",
      comment_upvotes: "all",
      comment_downvotes: "all",
      default_post_time_range_seconds: undefined,
      nsfw_content_disallowed: false,
      users: 1,
      posts: fixturePosts.length,
      comments: 0,
      communities: 1,
      users_active_day: 1,
      users_active_week: 1,
      users_active_month: 1,
      users_active_half_year: 1,
      email_notifications_disabled: false,
      suggested_multi_community_id: undefined,
      default_items_per_page: 50,
      image_mode: "StoreLinkPreviews",
      image_proxy_bypass_domains: undefined,
      image_upload_timeout_seconds: 30,
      image_max_thumbnail_size: 256,
      image_max_avatar_size: 512,
      image_max_banner_size: 1024,
      image_max_upload_size: 50_000_000,
      image_allow_video_uploads: false,
      image_upload_disabled: false,
    },
    local_site_rate_limit: {
      id: 1,
      local_site_id: 1,
      message: 60,
      message_per_second: 600,
      post: 6,
      post_per_second: 600,
      register: 3,
      register_per_second: 3600,
      image: 6,
      image_per_second: 3600,
      comment: 6,
      comment_per_second: 600,
      search: 60,
      search_per_second: 600,
      import_user_settings: 1,
      import_user_settings_per_second: 86_400,
      published_at: NOW,
      updated_at: undefined,
    },
    instance: {
      id: 1,
      domain: V1_HOST,
      published_at: NOW,
      updated_at: undefined,
      software: "lemmy",
      version: "1.0.0-beta.1",
    },
  },
  admins: [],
  version: "1.0.0-beta.1",
  all_languages: [],
  discussion_languages: [],
  tagline: undefined,
  oauth_providers: [],
  admin_oauth_providers: [],
  blocked_urls: [],
  active_plugins: [],
  last_application_duration_seconds: undefined,
  captcha_enabled: false,
};

// --- Modlog fixture: exercises the new flat ModlogView shape ---

const modlogView = (
  kind: string,
  id: number,
  extra: Record<string, unknown> = {},
) => ({
  modlog: {
    id,
    kind,
    is_revert: false,
    reason: null,
    expires_at: null, // intentionally null to exercise null → undefined handling
    published_at: NOW,
    bulk_action_parent_id: null,
  },
  moderator: mod,
  target_person: undefined,
  target_instance: undefined,
  target_community: undefined,
  target_post: undefined,
  target_comment: undefined,
  ...extra,
});

export const fixtureModlog = [
  modlogView("mod_feature_post_community", 1, {
    target_post: fixturePosts[0]!.post,
    target_community: community(),
  }),
  modlogView("admin_ban", 2, {
    target_person: bannedPerson,
    modlog: {
      id: 2,
      kind: "admin_ban",
      is_revert: false,
      reason: "Spam",
      expires_at: null,
      published_at: NOW,
      bulk_action_parent_id: null,
    },
  }),
  modlogView("mod_remove_comment", 3, {
    target_community: community(),
    target_person: bannedPerson,
    modlog: {
      id: 3,
      kind: "mod_remove_comment",
      is_revert: false,
      reason: "Bad comment",
      expires_at: null,
      published_at: NOW,
      bulk_action_parent_id: null,
    },
  }),
];

/**
 * Set up Playwright route handlers that make voyager think it's
 * connected to a fresh Lemmy v1 instance. Mocks every endpoint the
 * v1 path touches at app startup, plus opt-in extras.
 */
export async function mockV1(page: Page) {
  // nodeinfo discovery
  await page.route(
    `https://${V1_HOST}/.well-known/nodeinfo`,
    async (route) => {
      await route.fulfill({ json: wellknownNodeinfo });
    },
  );
  await page.route(`https://${V1_HOST}/nodeinfo/2.1`, async (route) => {
    await route.fulfill({ json: nodeinfo21 });
  });

  // Site bootstrap
  await page.route(
    `**/api/v4/site${(/* trailing query */ "**")}`,
    async (route) => {
      await route.fulfill({ json: siteResponse });
    },
  );

  // Post list (PagedResponse<PostView>)
  await page.route(`**/api/v4/post/list**`, async (route) => {
    await route.fulfill({
      json: {
        items: fixturePosts,
        next_page: null,
        prev_page: null,
      },
    });
  });

  // Comment list (empty)
  await page.route(`**/api/v4/comment/list**`, async (route) => {
    await route.fulfill({
      json: { items: [], next_page: null, prev_page: null },
    });
  });

  // Modlog
  await page.route(`**/api/v4/modlog**`, async (route) => {
    await route.fulfill({
      json: {
        items: fixtureModlog,
        next_page: null,
        prev_page: null,
      },
    });
  });

  // Federated instances (paginated; throws UnsupportedError in adapter; voyager catches)
  await page.route(`**/api/v4/federated_instances**`, async (route) => {
    await route.fulfill({ status: 400, json: { error: "paginated" } });
  });
}
