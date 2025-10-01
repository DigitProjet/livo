import { Link } from 'react-router-dom'

interface FooterLinksProps {
  title: string
  links: Array<{
    label: string
    to: string
    external?: boolean
  }>
}

export const FooterLinks = ({ title, links }: FooterLinksProps) => {
  return (
    <div>
      <h4 className="text-lg font-semibold mb-6">{title}</h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.to}>
            {link.external ? (
              <a 
                href={link.to}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-gray-300 hover:text-white transition-colors group"
              >
                <span>{link.label}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
              </a>
            ) : (
              <Link 
                to={link.to}
                className="flex items-center justify-between text-gray-300 hover:text-white transition-colors group"
              >
                <span>{link.label}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}