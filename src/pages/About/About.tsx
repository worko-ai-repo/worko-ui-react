import AboutIntro from '@Components/About/AboutIntro'
import AboutOutro from '@Components/About/AboutOutro'
import AboutTeam from '@Components/About/AboutTeam'
import OurValues from '@Components/About/OurValues'
import ProblemsWeSolve from '@Components/About/ProblemsWeSolve'


const About = () => {
  return (
    <div className="w-full bg-transparent ">
			<AboutIntro />
            <ProblemsWeSolve />
            <OurValues />
            <AboutTeam />
            <AboutOutro />
		</div>
  )
}

export default About