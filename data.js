const data = {
    // "start": { "text": "Do you like being the centre of attention?", "yes": "Asteroid Eros", "no": "q10" },
    "start": { "text": "Do you like being the centre of attention?", "yes": "q1", "no": "q10" },
    "q1": { "text": "Do you lead an active lifestyle?", "yes": "q2", "no": "q5" },
    "q2": { "text": "Do you feel brighter than those around you?", "yes": "Sirius", "no": "q3" },
    "q3": { "text": "Do you easily change your point of view?", "yes": "Alpha Centauri", "no": "q4" },
    "q4": { "text": "Do you consider yourself young and full of energy?", "yes": "Sun", "no": "Red Giant" },
    "q5": { "text": "Do you like fast and significant changes?", "yes": "q6", "no": "q7" },
    "q6": { "text": "Is it easy to make you lose your temper?", "yes": "Supernova", "no": "Quasar" },
    "q7": { "text": "Do you feel like people are drawn to you?", "yes": "Black Hole", "no": "q8" },
    "q8": { "text": "Do you feel like you have a strong influence on those around you?", "yes": "Magnetar", "no": "q9" },
    "q9": { "text": "Do you want to live a long and completely peaceful life?", "yes": "White Dwarf", "no": "Pulsar" },
    "q10": { "text": "Do you enjoy working in a team?", "yes": "q11", "no": "q16" },
    "q11": { "text": "Can you describe yourself as organised and consistent?", "yes": "q12", "no": "q13" },
    "q12": { "text": "Do you prefer to spend more time at home?", "yes": "Milky Way Galaxy", "no": "Andromeda Galaxy" },
    "q13": { "text": "Do you concentrate well?", "yes": "q14", "no": "q15" },
    "q14": { "text": "Do you feel more comfortable when everything is stable?", "yes": "Asteroid Belt", "no": "Perseids" },
    "q15": { "text": "Was there an event in your life that changed you significantly?", "yes": "Crab Nebula", "no": "Orion Nebula" },
    "q16": { "text": "Are you comfortable being alone?", "yes": "q17", "no": "q26" },
    "q17": { "text": "Do you consider yourself a follower?", "yes": "q18", "no": "q21" },
    "q18": { "text": "Do you consider yourself mysterious?", "yes": "q19", "no": "q20" },
    "q19": { "text": "Do you drink enough water throughout the day?", "yes": "Europa", "no": "Titan" },
    "q20": { "text": "Do you feel the energy of the ocean?", "yes": "Moon", "no": "Phobos" },
    "q21": { "text": "Do you feel more comfortable when you have a plan?", "yes": "q22", "no": "q24" },
    "q22": { "text": "Do you believe in aliens?", "yes": "Proxima Centauri b", "no": "q23" },
    "q23": { "text": "Is it important for you to always be in first place?", "yes": "Mercury", "no": "Venus" },
    "q24": { "text": "Are you emotional and spontaneous?", "yes": "Halley's Comet", "no": "q25" },
    "q25": { "text": "Are you a risk taker?", "yes": "Asteroid Eros", "no": "Asteroid Ceres" },
    "q26": { "text": "Do you often feel like you don't conform to societal norms?", "yes": "Pluto", "no": "q27" },
    "q27": { "text": "Do you prefer stability and order over chaos and constant change?", "yes": "q28", "no": "q30" },
    "q28": { "text": "Are you drawn to the unknown?", "yes": "q29", "no": "Earth" },
    "q29": { "text": "Do you rely on logic more often than you trust your intuition?", "yes": "Mars", "no": "Neptune" },
    "q30": { "text": "Do you enjoy being surrounded by a lot of people and events happening?", "yes": "Saturn", "no": "Jupiter" }
};

const results = {
    "Asteroid Eros": {
        color: "#A08C6C",
        image: "pictures/Asteroid Eros.png",
        text: `Asteroid Eros (433 Eros) is a near-Earth, rocky asteroid discovered in 1898, and was the first asteroid studied up close by a spacecraft (NASA’s NEAR Shoemaker, 2000).

Irregular Shape: Eros has a potato-like shape, measuring approximately 16.8 kilometers long and 7.5 kilometers wide, making it one of the larger Near-Earth asteroids.

Crosses Earth's Orbit: Eros is a potentially hazardous asteroid due to its Earth-crossing orbit, but it poses no immediate threat.`},

    "Phobos": {
        color: "#A99F98",
        image: "pictures/Phobos.png",
        text: `Phobos is one of Mars' two moons and is the larger and closer of the two, resembling an irregularly shaped potato.

Rapid Orbit: Phobos orbits Mars very quickly, completing a full orbit in just about 7.6 hours, which is faster than Mars rotates and means that it rises in the west and sets in the east.

Potential Future: Scientists believe that Phobos may eventually crash into Mars or break apart and form a ring around the planet due to its gradually decreasing orbit.`},

    "Titan": {
        color: "#69A66E",
        image: "pictures/Titan.png",
        text: `Titan is Saturn's largest moon and the second-largest in the solar system, famous for its thick atmosphere and lakes of liquid methane and ethane.

Unique Atmosphere: Titan has a dense atmosphere that is mostly nitrogen, which is rare for a moon, and it experiences weather systems similar to Earth, including clouds and rain.

Liquid Lakes: Its surface is dotted with lakes and rivers of liquid methane and ethane, making it one of the few places in the solar system where stable liquids exist on the surface.`},

    "Europa": {
        color: "#9B8F6A",
        image: "pictures/Europa.png",
        text: `Europa is one of Jupiter's largest moons, covered in a thick layer of ice, and is thought to have a subsurface ocean, making it a candidate in the search for extraterrestrial life.

Potential for Life: Scientists believe that Europa's ocean may contain more than twice the amount of water found on Earth, creating a suitable environment for life.

Geological Activity: Europa's surface shows signs of geological activity, such as ridges and cracks, suggesting that it may be actively reshaping itself.`},

    "Jupiter": {
        color: "#D5C6AB",
        image: "pictures/Jupiter.png",
        text: `Jupiter is the largest planet in the solar system, a gas giant with a mass over 300 times that of Earth. It orbits the Sun at a distance of about 778 million kilometers. 

Great Red Spot: Jupiter has a massive storm called the Great Red Spot, which has been raging for centuries and is larger than Earth.

Moons: Jupiter has at least 79 moons, including the largest, Ganymede, which is almost as big as Mars.`},

    "Saturn": {
        color: "#DCB668",
        image: "pictures/Saturn.png",
        text: `Saturn is the sixth planet from the Sun and is known for its ring system, which is made up of ice and rock particles. It is a gas giant with a diameter of about 139,822 kilometers.

Ring System: Saturn's rings are the most extensive and complex in the solar system, spanning up to 282,000 kilometers wide.

Moon Count: Saturn has over 80 moons, with Titan being the largest, which is larger than the planet Mercury and has a dense atmosphere.`},

    "Moon": {
        color: "#F5ECE2",
        image: "pictures/Moon.png",
        text: `The Moon is Earth's only natural satellite, orbiting the planet at an average distance of about 384,400 kilometers. It is the fifth-largest moon in the solar system. 

Phases: The Moon goes through phases, from new moon to full moon, due to its orbit around Earth and the sunlight reflecting off its surface.

Tides: The Moon's gravitational pull causes tides on Earth, influencing ocean levels and tidal movements.`},

    "Pluto": {
        color: "#EFAE99",
        image: "pictures/Pluto.png",
        text: `Pluto is a dwarf planet located in the Kuiper Belt. Once classified as the ninth planet of our solar system, Pluto was redefined as a dwarf planet in 2006.

Surface Composition: Pluto's surface is primarily composed of ice and rock, with a landscape that includes mountains, valleys, and frozen plains.

Atmosphere: Pluto's thin atmosphere, mainly nitrogen with some methane and carbon monoxide, expands and contracts as it moves closer to or farther from the Sun.`},

    "Earth": {
        color: "#2FAFD9",
        image: "pictures/Earth.png",
        text: `Earth is the third planet from the Sun, where all known life exists. It's a rocky planet with oceans, mountains, and a perfect atmosphere for living things – the place we all call home.

Life-Supporting Atmosphere: Earth's atmosphere contains the right balance of oxygen, nitrogen, and other gases to support life, with liquid water covering 70% of its surface.

Magnetic Field: The Earth’s strong magnetic field helps protect the planet from harmful solar radiation.`},

    "Mars": {
        color: "#FC825D",
        image: "pictures/Mars.png",
        text: `Mars is the fourth planet from the Sun and is known as the "Red Planet" due to its reddish appearance, which comes from iron oxide (rust) on its surface.

Moons: Mars has two small moons, Phobos and Deimos, which are thought to be captured asteroids.

Water Evidence: Mars has signs of ancient water flow and polar ice caps, suggesting it once had liquid water on its surface.`},

    "Asteroid Ceres": {
        color: "#A598BD",
        image: "pictures/Asteroid Ceres.png",
        text: `Ceres is the largest object in the asteroid belt between Mars and Jupiter and was the first asteroid discovered (in 1801). In 2015, NASA's Dawn spacecraft became the first to orbit Ceres, providing detailed study.

Dwarf planet: Ceres is classified as a dwarf planet and makes up about 30% of the total mass of the asteroid belt.

Ice and water: Ceres contains traces of water ice and possibly subsurface water reservoirs.`},

    "Halley's Comet": {
        color: "#B3A0D7",
        image: "pictures/Halley Comet.png",
        text: `Halley's Comet is the most famous short-period comet made of ice, dust, and gas, returning every 75–76 years. It was named after astronomer Edmund Halley, who predicted its return in 1705, marking a significant event in astronomy.

Visible to the naked eye: Halley's Comet has been observed for centuries, last seen in 1986.

Spacecraft exploration: In 1986, ESA's Giotto and other spacecraft studied its nucleus.`},

    "Proxima Centauri b": {
        color: "#E0D8A0",
        image: "pictures/Proxima Centauri b.png",
        text: `Proxima Centauri b is an exoplanet orbiting the star Proxima Centauri, the closest known star to the Sun, located about 4.24 light-years away.

Habitable Zone: Proxima Centauri b lies within the habitable zone of its star, where conditions may allow for liquid water, making it a candidate for potential life.

Earth-like Characteristics: The planet is roughly Earth-sized and has a mass at least 1.17 times that of Earth, suggesting it could have a rocky surface.`},

    "Milky Way Galaxy": {
        color: "#CF94DE",
        image: "pictures/Milky Way Galaxy.png",
        text: `The Milky Way Galaxy is a barred spiral galaxy containing our solar system, with an estimated 100 to 400 billion stars and a diameter of about 100,000 light-years.

Supermassive black hole: It has a central bulge, a flat disk with spiral arms full of stars, and Sagittarius A*, a black hole 4.1 million times the Sun's mass, at its centre.

Galactic neighborhood: The Milky Way is part of the Local Group, which includes the Andromeda Galaxy and other smaller galaxies.`},

    "Neptune": {
        color: "#5A9FF3",
        image: "pictures/Neptune.png",
        text: `Neptune is the eighth planet from the Sun and the most distant in our solar system, orbiting at about 4.5 billion kilometers away, in the cold, mysterious outer reaches of our solar system.

Strongest Winds: It has the fastest winds in the solar system, reaching speeds of up to 2,100 km/h.

Blue Color: Its stunning blue color comes from methane in its atmosphere, which absorbs red light and reflects blue.`},

    "Andromeda Galaxy": {
        color: "#D1BCAF",
        image: "pictures/Andromeda Galaxy.png",
        text: `The Andromeda Galaxy is the nearest spiral galaxy to the Milky Way and is on a collision course with our galaxy, expected to merge in about 4.5 billion years.

Size and Structure: It contains over one trillion stars, making it about twice the size of the Milky Way, and spans roughly 220,000 light-years in diameter.

Visibility: Andromeda is visible to the naked eye from Earth, appearing as a faint smudge in the night sky, particularly during autumn months.`},

    "Mercury": {
        color: "#A1AFB4",
        image: "pictures/Mercury.png",
        text: `Mercury is the closest planet to the Sun and is the smallest planet in the solar system, known for its extreme temperature fluctuations due to its thin atmosphere.

Surface Features: Mercury's surface is covered with craters, similar to the Moon, and it has large, smooth plains.

Day and Night Cycle: A day on Mercury (one rotation on its axis) lasts about 59 Earth days, while its year (one orbit around the Sun) takes only 88 Earth days.`},

    "Venus": {
        color: "#D59E3D",
        image: "pictures/Venus.png",
        text: `Venus is the second planet from the Sun and is often called Earth’s "sister" due to its similar size and composition.

Extreme Temperatures: Venus has a thick atmosphere filled with carbon dioxide, leading to a runaway greenhouse effect, making it the hottest planet in the solar system, with surface temperatures around 465 °C.

Retrograde Rotation: Venus rotates in the opposite direction of most planets, causing the Sun to rise in the west and set in the east.`},

    "Crab Nebula": {
        color: "#C0BB67",
        image: "pictures/Crab Nebula.png",
        text: `The Crab Nebula is a supernova remnant, a vast cloud of gas and dust resulting from a stellar explosion, located in the constellation Taurus, formed from the explosion of a massive star about 1,000 years ago.

Pulsar at its Core: The nebula contains a pulsar, a rapidly rotating neutron star that emits beams of radiation, rotating about 30 times per second.

Bright Emission: It is one of the brightest sources of X-rays and gamma rays in the sky.`},

    "Perseids": {
        color: "#A99FC4",
        image: "pictures/Perseids.png",
        text: `The Perseids are a popular meteor shower that occurs annually between July and August, originating from the Swift-Tuttle comet.

Viewing Conditions: They are best viewed during the night, with peak activity occurring around August 12-13, when up to 100 meteors can be seen per hour under ideal conditions.

Name Origin: The Perseids are named after the constellation Perseus, from which they appear to radiate in the night sky.`},

    "Alpha Centauri": {
        color: "#EFF54E",
        image: "pictures/Alpha Centauri.png",
        text: `Alpha Centauri is a triple star system about 4.37 light-years from Earth.

Closest Neighbor: Proxima Centauri, one of the three stars, is the closest known star to the Sun and has at least one confirmed exoplanet, Proxima Centauri b, which lies in the star's habitable zone.

Binary System: Alpha Centauri A and B form a binary system, orbiting each other closely, while Proxima Centauri orbits the pair at a greater distance.`},

    "Sirius": {
        color: "#88AFEF",
        image: "pictures/Sirius.png",
        text: `Sirius is the brightest star in Earth's night sky, located about 8.6 light-years away in the constellation Canis Major.

Binary Star System: Sirius is a binary star system consisting of Sirius A, a bright main-sequence star, and Sirius B, a faint white dwarf.

Cultural Significance: Often called the "Dog Star," Sirius has been important in various ancient cultures, particularly for its use in tracking time and seasons.`},

    "Supernova": {
        color: "#C377A9",
        image: "pictures/Supernova.png",
        text: `A Supernova is a powerful and bright explosion that happens at the end of a star's life, making it shine incredibly bright before it disappears.

Two main types supernovae: Type I, which happens in a pair of stars where one steals gas from the other, and Type II, which occurs when a big star runs out of fuel and collapses.

Element Formation: Supernovae create and spread heavy elements throughout the universe, helping to form new stars and planets.`},

    "Orion Nebula": {
        color: "#DA828F",
        image: "pictures/Orion Nebula.png",
        text: `The Orion Nebula is a bright, diffuse cloud of gas and dust in the Milky Way galaxy, located about 1,344 light-years from Earth, and it is visible in the Orion constellation.

Star formation: It serves as a stellar nursery where new stars are born, as it contains the gas and dust essential for these processes.

Naked-eye visibility: The Orion Nebula is one of the most prominent nebulae and can be seen without a telescope.`},

    "Asteroid Belt": {
        color: "#A88880",
        image: "pictures/Asteroid Belt.png",
        text: `The Asteroid Belt is a region located between the orbits of Mars and Jupiter, containing millions of asteroids. It separates the inner rocky planets and the outer gas giants.

Diverse Composition: The asteroids vary in size, shape, and composition, with some being remnants from the early solar system and others possibly containing metals and minerals.

Ceres: The largest object in the asteroid belt is Ceres, which is classified as a dwarf planet and accounts for about 30% of the belt's total mass.`},

    "Pulsar": {
        color: "#C8E1FE",
        image: "pictures/Pulsar.png",
        text: `A Pulsar is a type of neutron star that rotates rapidly and emits beams of electromagnetic radiation from its magnetic poles.

Rapid Spin: Pulsars can rotate very fast, with some spinning hundreds of times per second! This makes them incredibly precise cosmic clocks.

Pulsing Signals: They send out beams of radio waves that look like pulses, which is how they got their name. Scientists can detect these signals to learn more about the universe!`},

    "Sun": {
        color: "#F08801",
        image: "pictures/Sun.png",
        text: `The Sun is a star at the centre of our solar system, providing light and warmth that makes life possible on Earth.

Structure: The Sun has different layers, including a hot core where energy is made, a glowing surface called the photosphere, and a huge atmosphere known as the corona.

Size and Temperature: The Sun is 109 times wider than Earth and fits over a million Earths inside! Its surface temperature is about 5,500 °C, while the core reaches 15 million °C.`},

    "Red Giant": {
        color: "#F53F16",
        image: "pictures/Red Giant.png",
        text: `A Red Giant is a late stage in a star's life cycle, marked by its expansion and cooling after using up hydrogen in its core, resulting in a reddish color.

Size: Red giants, like Betelgeuse, can be over 1,000 times larger than the Sun and is expected to eventually become a supernova.

Life Cycle: Red giants represent a transitional phase in stellar evolution. They shed outer layers to form planetary nebulae, leaving behind a white dwarf core.`},

    "Quasar": {
        color: "#D8812E",
        image: "pictures/Quasar.png",
        text: `A Quasar is an extremely bright and distant celestial object powered by a supermassive black hole at its centre, emitting massive amounts of energy.

Brightness and Distance: Quasars are some of the most luminous objects in the universe, often outshining entire galaxies, and are typically found billions of light-years away.

Active Galaxies: They represent the active phase of galaxies when their central black holes are consuming material, leading to intense radiation and jets of particles.`},

    "Black Hole": {
        color: "#D66D5F",
        image: "pictures/Black Hole.png",
        text: `A Black Hole is a region of space where gravity is so strong that not even light can escape. It forms when a massive star collapses under its own gravity.

Event Horizon: The boundary around a black hole, called the event horizon, marks the point beyond which nothing can escape its gravitational pull.

Supermassive Black Holes: These are found at the centre of most galaxies, including the Milky Way, and can have masses millions to billions of times that of our Sun.`},

    "Magnetar": {
        color: "#A4F0FF",
        image: "pictures/Magnetar.png",
        text: `A Magnetar is a type of neutron star that is characterised by an extremely strong magnetic field.

Super Strong Magnet: Magnetars have magnetic fields that are a trillion times stronger than Earth's! This makes them the most powerful magnetic objects in the universe.

Flashes of Light: They release bursts of X-rays and gamma rays, which can be seen from far away. These powerful flashes can light up the sky and help scientists understand more about space!`},

    "White Dwarf": {
        color: "#D2FAFA",
        image: "pictures/White Dwarf.png",
        text: `A White Dwarf is the compact remnant of a low- to medium-mass star that has exhausted its nuclear fuel. These stars no longer undergo fusion but shine due to residual heat.

Size: Though about the size of Earth, a white dwarf is incredibly dense, with the mass of the Sun packed into a small volume.

Cooling Star: Over billions of years, white dwarfs gradually cool and fade as they release their stored thermal energy.`}
};
