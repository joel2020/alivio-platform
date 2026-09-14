import { Link, useLocation } from 'react-router-dom';
import { getPageBreadcrumbs } from '../../lib/pageSeo';

export default function MarketingBreadcrumbs() {
  const { pathname } = useLocation();
  const items = getPageBreadcrumbs(pathname);
  if (!items.length) return null;
  return <nav aria-label="Breadcrumb" className="mkt-container recruiting-breadcrumbs"><ol>
    {items.map((item, index) => <li key={item.path}>{index === items.length - 1
      ? <span aria-current="page">{item.name}</span>
      : <Link to={item.path}>{item.name}</Link>}</li>)}
  </ol></nav>;
}
