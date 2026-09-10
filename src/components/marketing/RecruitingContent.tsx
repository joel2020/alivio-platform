import { Link } from 'react-router-dom';
import { ArrowUpRight, Check } from 'lucide-react';

import { practices, searchSteps } from '../../lib/recruitingContent';

export function Benefits({ items }: { items: string[] }) {
  return <ul className="recruiting-benefits">{items.map(item => <li key={item}><Check size={18} aria-hidden="true" />{item}</li>)}</ul>;
}
export function SearchProcess() {
  return <ol className="recruiting-process">{searchSteps.map(([title, copy], i) => <li key={title}><span className="recruiting-step">0{i + 1}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol>;
}
export function PracticeCards() {
  return <div className="recruiting-practices">{practices.map(practice => <Link key={practice.slug} to={`/industries/${practice.slug}`} className="recruiting-practice"><img src={practice.image} alt={practice.alt} width="850" height="560" loading="lazy" /><div><h3>{practice.title}</h3><p>{practice.copy}</p><span>Explore our practice <ArrowUpRight size={19} aria-hidden="true" /></span></div></Link>)}</div>;
}
