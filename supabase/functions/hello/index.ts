Deno.serve(() => {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Hello from JusTus"
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  )
})