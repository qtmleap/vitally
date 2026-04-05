export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Vinext App</h1>
        <p className="text-lg text-muted-foreground">
          Vinext + Cloudflare Workers template
        </p>
      </div>

      <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        <Card
          title="File-based Routing"
          description="App Router style routing powered by Vinext"
        />
        <Card
          title="Cloudflare Workers"
          description="Edge-first deployment with Cloudflare"
        />
        <Card
          title="Tailwind CSS"
          description="Utility-first CSS with Shadcn components"
        />
        <Card
          title="Type Safety"
          description="Zodios + Zod for end-to-end type safety"
        />
      </div>
    </main>
  )
}

function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
