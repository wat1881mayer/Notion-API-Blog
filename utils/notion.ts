import { Client } from '@notionhq/client';
import next from 'next';

const notion = new Client({ auth: process.env.NOTION_KEY as string });

const databaseId = process.env.NOTION_DATABASE_ID as string;

export const fetchPages = async ({
  slug,
  tag,
}: {
  slug?: string;
  tag?: string;
}) => {
  const and: any = [
    {
      property: 'isPublic',
      checkbox: {
        equals: true,
      },
    },
    {
      property: 'slug',
      rich_text: {
        is_not_empty: true,
      },
    },
  ];

  if (slug) {
    and.push({
      property: 'slug',
      rich_text: {
        equals: slug,
      },
    });
  }
  if (tag) {
    and.push({
      property: 'tags',
      multi_select: {
        contains: tag,
      },
    });
  }

  return await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: and,
    },
    sorts: [
      {
        property: 'published',
        direction: 'descending',
      },
    ],
  });
};

export const fetchBlocksByPageId = async (pageId: string) => {
  const data = [];
  let cursor: string | undefined = undefined;

  while (true) {
    const { results, next_cursor }: any = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });

    data.push(...results);
    if (!next_cursor) break;
    cursor = next_cursor;
  }
  return await notion.blocks.children.list({ block_id: pageId });
};
