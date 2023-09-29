// Global variables
let baseUrl = '';
let headers = {};

function showAlert(message, alertType) {
    const alertDiv = `<div class="alert alert-${alertType} alert-dismissible fade show mt-3" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
    $('#alertsContainer').append(alertDiv);
}


// Function to clear saved settings from localStorage
function clearSavedData() {
    localStorage.removeItem('ip');
    localStorage.removeItem('port');
    localStorage.removeItem('apiKey');
    localStorage.removeItem('protocol');
    $('#clearDataModal').modal('show');  // Show modal instead of alert
}

// Function to save settings to localStorage
function saveSettings() {
    const ip = $('#ip').val();
    const port = $('#port').val();
    const apiKey = $('#apiKey').val();
    const protocol = $('#protocol').val();
    const saveDetails = $('#saveDetails').is(':checked');

    const storedIp = localStorage.getItem('ip');
    const storedPort = localStorage.getItem('port');
    const storedApiKey = localStorage.getItem('apiKey');
    const storedProtocol = localStorage.getItem('protocol');

    if (saveDetails && (ip !== storedIp || port !== storedPort || apiKey !== storedApiKey || protocol !== storedProtocol)) {
        localStorage.setItem('ip', ip);
        localStorage.setItem('port', port);
        localStorage.setItem('apiKey', apiKey);
        localStorage.setItem('protocol', protocol);
        $('#detailsSavedModal').modal('show');  // Show modal instead of alert
    }
}

// Function to load settings from localStorage
function loadSettings() {
    const ip = localStorage.getItem('ip');
    const port = localStorage.getItem('port');
    const apiKey = localStorage.getItem('apiKey');
    const protocol = localStorage.getItem('protocol');

    if (ip && port && apiKey && protocol) {
        $('#ip').val(ip);
        $('#port').val(port);
        $('#apiKey').val(apiKey);
        $('#protocol').val(protocol);
        $('#saveDetails').prop('checked', true);
    }
}

// Call loadSettings when the page loads
$(document).ready(function () {
    loadSettings();
});

async function apiCall(base_url, endpoint, headers, method = 'GET', params = null) {
    const url = `${base_url}${endpoint}`;
    try {
        const response = await $.ajax({
            url: url,
            type: method,
            headers: headers,
            data: params,
            dataType: 'json'
        });

        // Suppress error message for status 200 responses for DELETE requests
        if (response === null && method === 'DELETE') {
            return {success: true};
        }

        return response;
    } catch (error) {
        // Suppress error message for status 200 responses for DELETE requests
        if (error.status === 200 && method === 'DELETE') {
            return {success: true};
        }
        console.error('API call failed', error);
        return null;
    }
}


async function fetchQueue() {
    const ip = $('#ip').val();
    const port = $('#port').val();
    const apiKey = $('#apiKey').val();
    const protocol = $('#protocol').val();

    baseUrl = `${protocol}://${ip}:${port}/api/v3/`;
    headers = {'Content-Type': 'application/json', 'X-Api-Key': apiKey};

    let queueParams = {
        page: 1,
        pageSize: 250,
        includeUnknownSeriesItems: true
    };

    try {
        // Show loading indicator
        $('#loadingIndicator').removeClass('d-none');

        const queueInfo = await apiCall(baseUrl, 'queue', headers, 'GET', queueParams);
        const totalItems = queueInfo.totalRecords;

        if (totalItems === 0) {
            // Display a message for no stalled downloads
            $('#stalledList').html('<p>No stalled downloads found.</p>');
            return;
        }

        queueParams.pageSize = totalItems;
        const records = await apiCall(baseUrl, 'queue', headers, 'GET', queueParams);

        const stalledRecords = records.records.filter(record =>
            record.errorMessage === 'The download is stalled with no connections' ||
            record.errorMessage === 'qBittorrent is downloading metadata'
        );

        if (stalledRecords.length === 0) {
            // Display a message for no stalled downloads
            $('#stalledList').html('<p>No stalled downloads found.</p>');
            return;
        }

        // Populate list
        const list = $('#stalledList');
        list.empty();
        stalledRecords.forEach(record => {
            list.append(`<li class="list-group-item"><input type="checkbox" class="form-check-input me-2" value="${record.id}">${record.id} - ${record.title}</li>`);
        });

        // Attach select all handler
        $('#selectAll').on('click', function () {
            $('.form-check-input:not(.exclude-from-select-all)').prop('checked', $(this).prop('checked'));
        });
    } catch (error) {
        console.error('API call failed', error);
    } finally {
        // Hide loading indicator
        $('#loadingIndicator').addClass('d-none');
    }

    // Call saveSettings to save the settings if checkbox is checked
    saveSettings();
}


async function confirmBlacklist() {
    const selectedIds = [];
    $('#stalledList input:checked').each(function () {
        selectedIds.push($(this).val());
    });

    if (selectedIds.length === 0) {
        $('#noDownloadsModal').modal('show');
        return;
    }

    $('#confirmModal').modal('hide');

    const blacklistBtn = $('#blacklistBtn');
    const spinner = blacklistBtn.find('.spinner-border');

    blacklistBtn.prop('disabled', true); // Disable the button during processing
    spinner.show(); // Show the spinner

    // Read the state of the redownload checkbox
    const redownloadCheckbox = $('#redownloadCheckbox').is(':checked');

    for (const id of selectedIds) {
        const params = {removeFromClient: true, blocklist: true};

        // Set skipRedownload based on the redownload checkbox state
        if (!redownloadCheckbox) {
            params.skipRedownload = true;
        }

        try {
            await apiCall(baseUrl, `queue/${id}`, headers, 'DELETE', params);
            console.log(`Successfully blacklisted record with ID ${id}`);

            // Show a success alert
            showAlert(`Download ID ${id} has been blacklisted.`, 'success');

            // Remove the corresponding list item from the DOM
            $(`#stalledList input[value="${id}"]`).closest('li').remove();
        } catch (error) {
            console.error(`Failed to blacklist record with ID ${id}`, error);

            // Show an error alert
            showAlert(`Failed to blacklist ID ${id}: ${error.message}`, 'danger');
        }
    }

    blacklistBtn.prop('disabled', false); // Re-enable the button after processing
    spinner.hide(); // Hide the spinner
}

