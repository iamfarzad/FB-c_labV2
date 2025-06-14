import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">UI Components</h1>
          <p className="text-muted-foreground">
            A collection of reusable components built with Radix UI and Tailwind CSS
          </p>
        </header>

        <section id="buttons" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Buttons</h2>
          <div className="flex flex-wrap gap-4 p-4 border rounded-lg">
            <Button>Default</Button>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="glass">Glass</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap gap-4 p-4 bg-gray-900 rounded-lg">
            <Button variant="outline" className="text-white">Light Outline</Button>
            <Button variant="ghost" className="text-white">Light Ghost</Button>
          </div>
        </section>

        <section id="cards" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Cards</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>This is a basic card component</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card content goes here. You can put any content inside a card.</p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
                <CardDescription>With glass effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card has a glass effect background.</p>
              </CardContent>
            </Card>

            <Card className="hover:border-orange-500 transition-colors">
              <CardHeader>
                <CardTitle>Hoverable Card</CardTitle>
                <CardDescription>Hover over me</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card changes border color on hover.</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Action</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section id="forms" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Form Elements</h2>
          <div className="grid gap-6 max-w-2xl">
            <div className="space-y-2">
              <label htmlFor="input-example" className="text-sm font-medium">Input</label>
              <Input id="input-example" placeholder="Type something..." />
            </div>
            <div className="space-y-2">
              <label htmlFor="textarea-example" className="text-sm font-medium">Textarea</label>
              <Textarea id="textarea-example" placeholder="Type your message here..." rows={4} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dropdown Menu</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Open Menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      Profile
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Settings
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Log out
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>

        <section id="avatar" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Avatar</h2>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
              <AvatarFallback>VC</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>FB</AvatarFallback>
            </Avatar>
          </div>
        </section>

        <section id="dialog" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Dialog</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive">Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </div>
  )
}
