import Link from 'next/link';

import NowPlaying from '@/components/NowPlaying';

const ExternalLink = ({ href, children }) => (
  <a
    className="text-gray-500 hover:text-gray-600 transition"
    target="_blank"
    rel="noopener noreferrer"
    href={href}
  >
    {children}
  </a>
);

export default function Footer() {
  return (
    <footer className="flex flex-col justify-center items-start max-w-2xl mx-auto w-full mb-8">
      <hr className="w-full border-1 border-gray-200 dark:border-gray-800 mb-8" />
      <NowPlaying />
      <div className="w-full max-w-2xl grid grid-cols-1 gap-4 pb-16 sm:grid-cols-3">
        <div className="flex flex-col space-y-4">
          <Link href="/" className="text-gray-500 hover:text-gray-600 transition">
            Home
          </Link>
          <Link href="/blog" className="text-gray-500 hover:text-gray-600 transition">
            Blog
          </Link>
          <Link href="/uses" className="text-gray-500 hover:text-gray-600 transition">
            Uses
          </Link>
          {/*<Link href="/about">*/}
          {/*  <a className="text-gray-500 hover:text-gray-600 transition">*/}
          {/*    About*/}
          {/*  </a>*/}
          {/*</Link>*/}
          {/*<Link href="/newsletter">*/}
          {/*  <a className="text-gray-500 hover:text-gray-600 transition">*/}
          {/*    Newsletter*/}
          {/*  </a>*/}
          {/*</Link>*/}
        </div>
        <div className="flex flex-col space-y-4">
          <ExternalLink href="https://www.linkedin.com/in/abhijit-ramesh-b583ab185/">
            Linkedin
          </ExternalLink>
          <ExternalLink href="https://github.com/abhijitramesh">GitHub</ExternalLink>
          <ExternalLink href="https://gitlab.com/abhijitramesh">GitLab</ExternalLink>
        </div>
        <div className="flex flex-col space-y-4">
          <ExternalLink href="https://twitter.com/abhijitramesh2k">
            Twitter
          </ExternalLink>
          <ExternalLink href="https://www.youtube.com/channel/UCHB7v9t-ZOYE0ssOE5az04A">
            YouTube
          </ExternalLink>
          <ExternalLink href="https://www.instagram.com/the_abhijit_ramesh/">
            Instagram
          </ExternalLink>
        </div>
      </div>
    </footer>
  );
}