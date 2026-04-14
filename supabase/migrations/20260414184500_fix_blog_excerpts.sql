UPDATE blog_posts
SET excerpt = RTRIM(
  REGEXP_REPLACE(
    SUBSTRING(
      REGEXP_REPLACE(COALESCE(content, ''), '[#*`]', '', 'g')
      FROM 1 FOR 150
    ),
    '\s\S*$',
    ''
  )
) || '...';
