<p align="center">
    <img src="assets/logo.svg" height="128">
    <h1 style="border-bottom:none;font-size:60px;margin-bottom:0;" align="center" >Castore</h1>
</p>
<p align="center">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@castore/core">
    <img alt="" src="https://img.shields.io/npm/v/@castore/core?color=935e0e&style=for-the-badge">
  </a>
  <a aria-label="License" href="https://github.com/castore-dev/castore/blob/main/LICENSE">
    <img alt="" src="https://img.shields.io/github/license/castore-dev/castore?color=%23F8A11C&style=for-the-badge">
  </a>
    <img alt="" src=https://img.shields.io/npm/dt/@castore/core?color=%23B7612E&style=for-the-badge>
    <br/>
    <br/>
</p>

💖 _Huge thanks to the [sponsors](https://github.com/sponsors/ThomasAribart) who help me maintain this repo:_

<p align="center">
  <a href="https://www.theodo.fr/"><img src="https://github.com/theodo.png" width="50px" alt="Theodo" title="Theodo"/></a></td>&nbsp;&nbsp;
  <!-- sponsors --><a href="https://github.com/feathersdev"><img src="https://github.com/feathersdev.png" width="50px" alt="feathers.dev" title="feathers.dev"/></a>&nbsp;&nbsp;<a href="https://github.com/li-jia-nan"><img src="https://github.com/li-jia-nan.png" width="50px" alt="lijianan" title="lijianan"/></a>&nbsp;&nbsp;<a href="https://github.com/RaeesBhatti"><img src="https://github.com/RaeesBhatti.png" width="50px" alt="Raees Iqbal" title="Raees Iqbal"/></a>&nbsp;&nbsp;<a href="https://github.com/lucas-subli"><img src="https://github.com/lucas-subli.png" width="50px" alt="Lucas Saldanha Ferreira" title="Lucas Saldanha Ferreira"/></a>&nbsp;&nbsp;<a href="https://github.com/syntaxfm"><img src="https://github.com/syntaxfm.png" width="50px" alt="Syntax" title="Syntax"/></a>&nbsp;&nbsp;<!-- sponsors -->
  <a href="https://github.com/sponsors/ThomasAribart"><img src="assets/plus-sign.png" width="50px" alt="Plus sign" title="Your brand here!"/></a>
</p>

# Making Event Sourcing easy 😎

[Event Sourcing](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) is a data storage paradigm that saves **changes in your application state** rather than the state itself.

It is powerful as it enables **rewinding to a previous state** and **exploring audit trails** for debugging or business/legal purposes. It also integrates very well with [event-driven architectures](https://en.wikipedia.org/wiki/Event-driven_architecture).

However, it is **tricky to implement** 😅

After years of using it at [Theodo](https://dev.to/slsbytheodo), we have grown to love it, but also experienced first-hand the lack of consensus and tooling around it. That's where Castore comes from!

---

<p align="center">
  Castore is a TypeScript library that <b>makes Event Sourcing easy</b> 😎
</p>

---

## Features

**🙈 Stack agnostic**: Can be used in any JS context (web apps, containers, lambdas... you name it 🙌)

**🕊️ Light-weight**: _opt-in_ packages only

**🏋️ Type-safety** pushed to the limit

**📐 Validation library agnostic** ([Zod](https://github.com/colinhacks/zod), [JSON schema](https://github.com/ThomasAribart/json-schema-to-ts)...) with support for type inference

**😍 On-the-shelf adapters** for [Redux](https://redux.js.org/), [DynamoDB](https://aws.amazon.com/dynamodb/), [SQS](https://aws.amazon.com/sqs/), [EventBridge](https://aws.amazon.com/eventbridge/) and more

**🎯 Test tools** included

**🔧 Migration & maintenance utils** available

**🎨 React components** to visualize and model your event stores

And much more to come 🙌: Admin, snapshots, read models...

## Visit the 👉 [official documentation](https://castore-dev.github.io/castore/) 👈 to get started!

### [Become a Sponsor!](https://github.com/sponsors/thomasaribart/)
