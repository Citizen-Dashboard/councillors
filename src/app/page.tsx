import Link from "next/link";

export default async function Home() {
  return (
    <main className="max-w-3xl mx-auto mt-4">
      <h1 className="text-5xl">
        Citizen Dashboard: <strong>Councillors</strong>
      </h1>
      <nav className="underline my-2">
        <Link href="/councillors">Councillors</Link>
      </nav>

      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Et in at
        exercitationem expedita consequuntur fugiat? Minus nam fuga ullam
        voluptatibus ratione, rerum ut amet laborum distinctio eum natus,
        facilis labore quod veniam esse velit corporis cupiditate cum dolore
        quia temporibus placeat! Quae nisi saepe tempore ducimus eaque
        reprehenderit veniam, sunt qui quia, voluptatem quaerat blanditiis neque
        quidem cumque! Ad, ea. Magni natus itaque consequuntur. In tenetur
        ipsam, possimus, enim rem, aliquid consequuntur magni animi nam at
        corporis maiores neque quas nobis vitae cumque necessitatibus sunt autem
        delectus. Eum, consequuntur?
      </p>
    </main>
  );
}
