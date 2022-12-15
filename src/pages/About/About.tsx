import "./About.css";
const About = () => {
  return (
    <div className="about-container">
      <h2>About this website</h2>
      <p>
        Have you ever felt despair when your
        favorite Visual Novel will never get translated? Here is the site
        coming for the rescue. On this site, you can vote for your favorite
        Visual Novel and your visual novel will get translated soon with machine
        translation.
      </p>
      <h2>How do I release all of the translation patches on this site?</h2>
      <p>
        Basically, I collected multiple tools to extract the text, then create a
        translation patch by my programing skills with the help of Sugoi Model
        and then repack it into a patch. Shout out to these people who provide
        me with all the necessary stuffs to translate:
        <ul>
          <li>
            MingShiba (Sugoi model). This is his{" "}
            <a
              href="https://discord.gg/AEwRn3Wf"
              target={"_blank"}
              rel="noreferrer"
              style={{
                fontWeight: "700",
                textTransform: "uppercase",
              }}
            >
              Discord
            </a>
          </li>
          <li>
            Many other people from github (Tool extract text and repack patch)
          </li>
        </ul>
      </p>
      <h2>
        Why are there some Visual Novel games which you can't vote on this site?
      </h2>
      <p>
        There are multiple reasons:
        <ul>
          <li>Your voted VN has already had a English patch for it</li>
          <li>There's someone else in the process of translating it. Because there's no reason to translate a VN which soon will get a translation</li>
        </ul>
      </p>
    </div>
  );
};

export default About;
