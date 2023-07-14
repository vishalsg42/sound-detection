// let mediaRecorder;
// let chunks = [];

// // Get the user media (microphone) and start recording
// function startRecording() {
//     navigator.mediaDevices.getUserMedia({ audio: true })
//         .then(stream => {
//             mediaRecorder = new MediaRecorder(stream);
//             mediaRecorder.start();

//             // Register event handlers
//             mediaRecorder.addEventListener('dataavailable', event => {
//                 console.log("event", event)
//                 chunks.push(event.data);
//             });
//         })
//         .catch(error => {
//             console.error('Error accessing microphone:', error);
//         });
// }

// // Stop recording and send the captured voice data to the server
// function stopRecording() {
//     if (mediaRecorder && mediaRecorder.state === 'recording') {
//         mediaRecorder.stop();

//         // Process the captured voice data
//         mediaRecorder.addEventListener('stop', () => {
//             const blob = new Blob(chunks, { type: 'audio/wav' });
//             chunks = [];
//             console.log("chunks", chunks)

//             // Send the voice data to the server for identification
//             sendVoiceData(blob);
//         });
//     }
// }

// // Send the voice data to the server for identification
// function sendVoiceData(blob) {
//     const formData = new FormData();
//     formData.append('audio', blob, 'voice.wav');
//     //   console.log("formData", formData)

//     const requestOptions = {
//         method: 'POST',
//         body: formData,
//         redirect: 'follow'
//     };
//     console.log("requestOptions", requestOptions)

//     // Send the voice data to the server using fetch or XMLHttpRequest
//     fetch('http://127.0.0.1:8000/identify_voice', requestOptions)
//         .then(response => response.json())
//         .then(result => {
//             // Process the identification result
//             handleIdentificationResult(result);
//         })
//         .catch(error => {
//             console.error('Error sending voice data:', error);
//         });
// }

// // Process the identification result
// function handleIdentificationResult(result) {
//     // Display the identification result on the HTML page
//     const resultElement = document.createElement('p');
//     if (result.detected) {
//         resultElement.textContent = `Voice identified! Maximum frequency: ${result.frequency} Hz`;
//     } else {
//         resultElement.textContent = 'Voice not identified.';
//     }

//     document.body.appendChild(resultElement);
// }


jQuery(document).ready(function () {
    const $ = jQuery;
    const myRecorder = {
        objects: {
            context: null,
            stream: null,
            recorder: null,
            blob: []
        },
        init: function () {
            if (null === myRecorder.objects.context) {
                myRecorder.objects.context = new (
                    window.AudioContext || window.webkitAudioContext
                );
            }
        },
        start: function () {
            const options = { audio: true, video: false };
            navigator.mediaDevices.getUserMedia(options).then(function (stream) {
                myRecorder.objects.stream = stream;
                myRecorder.objects.recorder = new Recorder(
                    myRecorder.objects.context.createMediaStreamSource(stream),
                    { numChannels: 1 }
                );
                myRecorder.objects.recorder.record();
            }).catch(function (err) { });
        },
        stop: async function (listObject) {
            if (null !== myRecorder.objects.stream) {
                myRecorder.objects.stream.getAudioTracks()[0].stop();
            }
            if (null !== myRecorder.objects.recorder) {
                myRecorder.objects.recorder.stop();

                // Validate object
                if (null !== listObject
                    && 'object' === typeof listObject
                    && listObject.length > 0) {
                    // Export the WAV file
                    myRecorder.objects.recorder.exportWAV(function (blob) {
                        myRecorder.objects.blob.push(blob)
                        const url = (window.URL || window.webkitURL)
                            .createObjectURL(blob);

                        // Prepare the playback
                        const audioObject = $('<audio controls></audio>')
                            .attr('src', url);

                        // Prepare the download link
                        const downloadObject = $('<a>&#9660;</a>')
                            .attr('href', url)
                            .attr('download', new Date().toUTCString() + '.wav');

                        // Wrap everything in a row
                        const holderObject = $('<div class="row"></div>')
                            .append(audioObject)
                            .append(downloadObject);

                        // Append to the list
                        listObject.append(holderObject);
                    });
                }
            }
        }
    };

    // Prepare the recordings list
    const listObject = $('[data-role="recordings"]');

    // Prepare the record button
    $('[data-role="controls"] > button').click(async function (event) {
        event.preventDefault();
        // Initialize the recorder
        myRecorder.init();

        // Get the button state 
        const buttonState = !!$(this).attr('data-recording');

        // Toggle
        if (!buttonState) {
            $(this).attr('data-recording', 'true');
            myRecorder.start();
        } else {
            $(this).attr('data-recording', '');
            await myRecorder.stop(listObject);
            await sleep(1000)
            sendAudio(myRecorder.objects.blob.slice(-1))
        }
    });
    function sendAudio(blob) {
        if (!blob.length) {
            alert("No audio to send")
        }
        blob = blob[0]
        console.log("blob", blob)
        console.info("Sending Audio")
        // const form = new FormData();
        // form.append("audio", blob, "input-slurp-1.wav");

        // const settings = {
        //     "url": "http://127.0.0.1:8000/identify_voice",
        //     "method": "POST",
        //     "mimeType": "multipart/form-data",
        //     "data": form,
        //     "processData": false, // Ensure that jQuery does not process the data
        //     "contentType": false,
        // };

        // $.ajax(settings)
        //     .done(function (response) {
        //         console.log(response);
        //     });

        const data = new FormData();
        data.append("audio", blob, "input-slurp-1.wav");

        var xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                console.log(this.responseText);
            }
        });

        xhr.open("POST", "http://127.0.0.1:8000/identify_voice");

        xhr.send(data);
    }

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

});

