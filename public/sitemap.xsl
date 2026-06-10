<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="sitemap image xhtml">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>XML Sitemap</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f8fafc;
            color: #1e293b;
            font-size: 14px;
          }
          header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: #fff;
            padding: 2rem 1.5rem;
          }
          header h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
          header p { opacity: 0.85; font-size: 0.875rem; }
          .stats {
            display: flex; gap: 1.5rem; flex-wrap: wrap;
            max-width: 1100px; margin: 1.5rem auto; padding: 0 1.5rem;
          }
          .stat {
            background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
            padding: 1rem 1.5rem; flex: 1; min-width: 140px;
          }
          .stat strong { display: block; font-size: 1.5rem; font-weight: 800; color: #dc2626; }
          .stat span { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
          main { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem 3rem; }
          .card {
            background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
            overflow: hidden; margin-bottom: 1rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          }
          .card-header {
            background: #f1f5f9; border-bottom: 1px solid #e2e8f0;
            padding: 0.75rem 1.25rem;
            display: flex; align-items: center; justify-content: space-between;
          }
          .card-header h2 { font-size: 0.875rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
          table { width: 100%; border-collapse: collapse; }
          th {
            text-align: left; padding: 0.625rem 1.25rem;
            font-size: 0.7rem; font-weight: 700; color: #94a3b8;
            text-transform: uppercase; letter-spacing: 0.07em;
            background: #f8fafc; border-bottom: 1px solid #e2e8f0;
          }
          td {
            padding: 0.75rem 1.25rem; border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
          }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background: #fafafa; }
          a { color: #dc2626; text-decoration: none; word-break: break-all; }
          a:hover { text-decoration: underline; }
          .badge {
            display: inline-block; font-size: 0.65rem; font-weight: 700;
            padding: 0.15rem 0.5rem; border-radius: 999px;
            text-transform: uppercase; letter-spacing: 0.04em;
          }
          .badge-daily   { background: #dcfce7; color: #16a34a; }
          .badge-weekly  { background: #dbeafe; color: #2563eb; }
          .badge-monthly { background: #fef9c3; color: #ca8a04; }
          .priority-high  { color: #16a34a; font-weight: 700; }
          .priority-med   { color: #2563eb; font-weight: 600; }
          .priority-low   { color: #94a3b8; }
          .img-thumb { width: 32px; height: 32px; border-radius: 6px; object-fit: cover; vertical-align: middle; }
          @media(max-width:640px){
            td, th { padding: 0.5rem 0.75rem; }
            .stat { min-width: 120px; }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>XML Sitemap</h1>
          <p>This sitemap contains <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong> URLs indexed for search engines.</p>
        </header>

        <div class="stats">
          <div class="stat">
            <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong>
            <span>Total URLs</span>
          </div>
          <div class="stat">
            <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url[sitemap:priority='1.0'])"/></strong>
            <span>High Priority</span>
          </div>
          <div class="stat">
            <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url[image:image])"/></strong>
            <span>With Images</span>
          </div>
          <div class="stat">
            <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url[sitemap:changefreq='daily'])"/></strong>
            <span>Daily Updates</span>
          </div>
        </div>

        <main>
          <div class="card">
            <div class="card-header">
              <h2>All URLs</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>URL</th>
                  <th>Last Modified</th>
                  <th>Frequency</th>
                  <th>Priority</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <xsl:sort select="sitemap:priority" order="descending"/>
                  <tr>
                    <td style="color:#94a3b8; font-size:0.75rem;"><xsl:value-of select="position()"/></td>
                    <td>
                      <a>
                        <xsl:attribute name="href"><xsl:value-of select="sitemap:loc"/></xsl:attribute>
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                    </td>
                    <td style="white-space:nowrap; color:#64748b;">
                      <xsl:value-of select="sitemap:lastmod"/>
                    </td>
                    <td>
                      <xsl:variable name="freq" select="sitemap:changefreq"/>
                      <span>
                        <xsl:attribute name="class">badge badge-<xsl:value-of select="$freq"/></xsl:attribute>
                        <xsl:value-of select="$freq"/>
                      </span>
                    </td>
                    <td>
                      <xsl:variable name="p" select="number(sitemap:priority)"/>
                      <span>
                        <xsl:attribute name="class">
                          <xsl:choose>
                            <xsl:when test="$p >= 0.8">priority-high</xsl:when>
                            <xsl:when test="$p >= 0.5">priority-med</xsl:when>
                            <xsl:otherwise>priority-low</xsl:otherwise>
                          </xsl:choose>
                        </xsl:attribute>
                        <xsl:value-of select="sitemap:priority"/>
                      </span>
                    </td>
                    <td>
                      <xsl:if test="image:image">
                        <img class="img-thumb">
                          <xsl:attribute name="src"><xsl:value-of select="image:image/image:loc"/></xsl:attribute>
                          <xsl:attribute name="alt"><xsl:value-of select="image:image/image:title"/></xsl:attribute>
                          <xsl:attribute name="loading">lazy</xsl:attribute>
                        </img>
                      </xsl:if>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
