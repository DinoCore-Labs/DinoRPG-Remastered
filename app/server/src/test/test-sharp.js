import sharp from 'sharp';

async function testSharp() {
	const buffer = await sharp({
		create: {
			width: 50,
			height: 50,
			channels: 3,
			background: { r: 0, g: 0, b: 0 }
		}
	})
		.webp()
		.toBuffer();

	console.log('Sharp OK, output size:', buffer.length);
}

testSharp();
