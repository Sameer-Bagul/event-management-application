import Image from "next/image"
import Link from "next/link"

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="flex-center wrapper flex-between flex flex-col gap-4 p-5 text-center sm:flex-row">
      <Link href="/" className="w-36 block dark:hidden">
          <Image 
            src="/assets/images/logo.svg" width={128} height={38}
            alt="Evently logo" 
          />
        </Link>
        <Link href="/" className="w-36 hidden dark:block">
          <Image 
            src="/assets/images/logo-dark.svg" width={128} height={38}
            alt="Evently logo" 
          />
        </Link>

        <p> All Rights reserved by APP Club</p>
      </div>
    </footer>
  )
}

export default Footer