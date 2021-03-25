import * as my_dongle from 'bleuio'

const output = document.querySelector("#output");
const connectButton = document.querySelector('#connectButton');
const scanButton = document.querySelector('#scanButton');
const numberOfResponsesField = document.querySelector('#numberOfResponsesField');
const targetAddressField = document.querySelector('#targetAddressField');

let connected = false;

/**
 * Connects / Disconnects the dongle
 */
const handleConnect = async () => {
    if (!connected) {
        connect();
    } else {
        disconnect();
    }
}

connectButton.addEventListener('click', handleConnect);

/**
 * Connects the the dongle via the computers COM port
 * Prompts the user to choose port from dialog in chrome
 * Enables the button to start the scan
 */
const connect = async () => {

    // Connect to dongle 
    await my_dongle.at_connect();

    connectButton.textContent = 'Disconnect';
    output.textContent = 'Connected to dongle';

    connected = true;

    // Enable the scan button which is disabled by default to avoid errors
    scanButton.addEventListener('click', handleScan);
    scanButton.classList.remove('disabled');
}

/**
 * Stops scanning and disconnects the dongle
 */
const disconnect = async () => {
    // Stop any ongoing process
    await my_dongle.stop();

    // Disconnects the dongle
    await my_dongle.at_disconnect();

    connected = false;

    output.textContent = 'Dongle disconnected';

    // Disable the scan button
    scanButton.classList.add('disabled');
    scanButton.textContent = 'Scan BLE devices';
    scanButton.removeEventListener('click', handleScan);

    connectButton.textContent = 'Connect';
}

/**
 * Starts the scan
 */
const handleScan = async () => {
    output.textContent = '';

    // Disable the scanButton until the advertising has completed
    scanButton.textContent = 'Scanning';
    scanButton.classList.add('disabled');

    // Set the dongle in central role
    await my_dongle.at_central();

    /**
     * Start scanning for a target and awaits a specified number responses
     * @param {int} responses number of responses until complete
     */
    const scanResponse = await my_dongle.at_scantarget(
        targetAddressField.value,
        parseInt(numberOfResponsesField.value)
    );

    // Print what the scanner had found before it was stopped
    printResponse(scanResponse);

    scanButton.textContent = 'Scan BLE devices';
    scanButton.classList.remove('disabled');
}

/**
 * Prints a response to the DOM
 * @param {String} response the message to be printed to the DOM
 */
const printResponse = (response) => {
    // Clear output
    output.textContent = '';

    // Some of the dongles functions returns the data in an Array
    if (Array.isArray(response)) {
        response.forEach(data => {
            // Adds the data in the response as a row of information in the DOM
            const outputLine = document.createElement("p");
            outputLine.setAttribute("style", "margin: 2px");
            outputLine.textContent = data;

            output.appendChild(outputLine);
        });
    }
}