import fs from 'fs';
import https from 'https'
import sharp from 'sharp'
import { jsPDF } from 'jspdf';

export const uploadImage = (req, res) => {
	const reqFiles = req.files;
	const fileNeedRotation = req.body.rotation;

	let currentFolderNumber = 1;
	fs.readdir('./data/', (err, files) => {
		let numberArray = [1];
		files.forEach((file) => {
			numberArray.push(parseInt(file.slice(-1)));
		})
		currentFolderNumber = Math.max(...numberArray);

		let currentPhotoNumber = 0;
		fs.readdir(`./data/pdf${currentFolderNumber}/`, (err, files) => {
			let numberArray = [0];
			files?.forEach((file) => {
				numberArray.push(parseInt(file.slice(-5, -4)));
			})
			currentPhotoNumber = Math.max(...numberArray);

			Object.keys(reqFiles).forEach((key) => {
				const filepath = `./data/pdf${currentFolderNumber}/temp${currentPhotoNumber + 1}.jpg`;
				reqFiles[key].mv(filepath, (err) => {
					if (err) return res.status(500).json({ status: '500 error', message: err });
				});
				setTimeout(() => {

					if (fileNeedRotation) {
						sharp(filepath)
							.rotate(-90)
							.resize({ width: 1024, height: 1024, fit: "cover" })
							.toFile(`./data/pdf${currentFolderNumber}/img${currentPhotoNumber + 1}.jpg`);

					} else {
						sharp(filepath)
							.resize({ width: 1024, height: 1024, fit: "cover" })
							.toFile(`./data/pdf${currentFolderNumber}/img${currentPhotoNumber + 1}.jpg`);
					}

					setTimeout(() => {
						fs.unlink(filepath, () => { });
					}, 1000)
				}, 1000)
			});
		});
	});

	res.sendStatus(200);
};





export const printPDF = async (req, res) => {

	const targetFile = `banners/banner.png`
	const wallpaperUrl = 'https://source.unsplash.com/featured/1080x1920/?grass'
	await downloadFile(wallpaperUrl, targetFile)

	setTimeout(() => {

		let currentFolderNumber = 1;
		fs.readdir('./data/', (err, files) => {
			let numberArray = [1];
			files.forEach((file) => {
				numberArray.push(parseInt(file.slice(-1)));
			})
			currentFolderNumber = Math.max(...numberArray);

			const doc = new jsPDF('p', 'mm', 'a4', true);
			let secondColumnX = 105;

			var width = doc.internal.pageSize.getWidth();
			var height = doc.internal.pageSize.getHeight();

			let bannerImage = fs.readFileSync(`./banners/banner.png`);

			fs.readdir(`./data/pdf${currentFolderNumber}`, (err, files) => {
				let i = 0;
				let filesCount = files.length;

				if (filesCount === 2) {
					doc.addImage(bannerImage, 'JPEG', 100, 0, 169, height, 'banner', 'FAST');
					files.forEach((file) => {
						if (file.includes('img')) {
							let currentPhoto = fs.readFileSync(`./data/pdf${currentFolderNumber}/${file}`);

							doc.addImage(currentPhoto, 'JPG', 0, 150 * i, 150, 150, undefined, 'FAST');

							i++;
						}
					});
				}

				if (filesCount === 3) {
					doc.addImage(bannerImage, 'JPEG', 75, 0, 169, height, 'banner', 'FAST');
					files.forEach((file) => {
						if (file.includes('img')) {
							let currentPhoto = fs.readFileSync(`./data/pdf${currentFolderNumber}/${file}`);

							doc.addImage(currentPhoto, 'JPG', 0, 100 * i, 100, 100, undefined, 'FAST');

							i++;
						}
					});
				}

				if (filesCount === 4) {
					doc.addImage(bannerImage, 'JPEG', 0, 0, 169, height, 'banner', 'FAST');
					doc.addImage(bannerImage, 'JPEG', secondColumnX, 0, 169, height, 'banner', 'FAST');

					files.forEach((file) => {
						if (file.includes('img')) {
							let currentPhoto = fs.readFileSync(`./data/pdf${currentFolderNumber}/${file}`);

							doc.addImage(currentPhoto, 'JPG', 0, 75 * i, 75, 75, undefined, 'FAST');
							doc.addImage(currentPhoto, 'JPG', secondColumnX, 75 * i, 75, 75, undefined, 'FAST');

							i++;
						}
					});
				}

				if (filesCount === 8) {
					doc.addImage(bannerImage, 'JPEG', 0, 0, 169, height, 'banner', 'FAST');
					doc.addImage(bannerImage, 'JPEG', secondColumnX, 0, 169, height, 'banner', 'FAST');

					files.forEach((file) => {
						if (file.includes('img')) {
							let currentPhoto = fs.readFileSync(`./data/pdf${currentFolderNumber}/${file}`);

							if (i < 4) {
								doc.addImage(currentPhoto, 'JPG', 0, 75 * i, 75, 75, undefined, 'FAST');
							} else {
								doc.addImage(currentPhoto, 'JPG', secondColumnX, 75 * (i - 4), 75, 75, undefined, 'FAST');
							}

							i++;
						}
					});
				}
			});

			setTimeout(() => {
				doc.save(`./data/pdf${currentFolderNumber}/doc.pdf`);


				fs.unlink(`./banners/banner.png`, () => { });

				if (!fs.existsSync(`./data/pdf${currentFolderNumber + 1}`)) {
					fs.mkdirSync(`./data/pdf${currentFolderNumber + 1}`);
				}
			}, 2000)

		});

		res.sendStatus(200);

	}, 1000)
};





async function downloadFile(url, targetFile) {
	return await new Promise((resolve, reject) => {
		https.get(url, response => {
			const code = response.statusCode ?? 0

			if (code >= 400) {
				return reject(new Error(response.statusMessage))
			}

			// handle redirects
			if (code > 300 && code < 400 && !!response.headers.location) {
				return resolve(
					downloadFile(response.headers.location, targetFile)
				)
			}

			// save the file to disk
			const fileWriter = fs
				.createWriteStream(targetFile)
				.on('finish', () => {
					resolve({})
				})

			response.pipe(fileWriter)
		}).on('error', error => {
			reject(error)
		})
	})
}