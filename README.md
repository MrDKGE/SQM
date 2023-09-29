# Sonarr Queue Manager

This is a simple web-based tool for managing the queue in Sonarr. You can use it to blacklist stalled downloads, and optionally redownload them.

## WARNING!
This tool will have bugs. It may not work as expected.  
I put this together in a few hours, so it's not perfect.  
This tool comes as is, if you are inexperienced with web development, I recommend you do not use this tool.  
If you do know what you're doing, feel free to contribute to the project.

## Getting Started

Follow these instructions to get the project up and running on your local machine for testing and development purposes.

### Prerequisites

- Local web server (Apache, Nginx, etc.), My favorite tool is [Laragon](https://laragon.org/).
- [Git](https://git-scm.com/) for version control.

### Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/MrDKGE/sonarr-queue-manager.git
    ```

## Usage
1. Go to the projects directory in your web server's root directory.

2. Fill in the Sonarr server details:
   * IP Address
   * Port
   * API Key
   * Protocol (HTTP or HTTPS)
3. Optionally, check the "Save Details Locally" checkbox to save your settings for future visits.
4. Click the "Fetch Queue" button to retrieve the stalled downloads from your Sonarr server.
5. The list of stalled downloads will be displayed. You can select individual downloads for blacklisting.
6. Click the "Blacklist Selected" button to blacklist the selected downloads. You can also choose to redownload them by checking the "Redownload blacklisted items" checkbox.

## Contributing
Contributions are welcome! If you'd like to improve this project, follow these steps:

1. Fork the repository on GitHub.
2. Clone your forked repository to your local machine.
3. Create a new branch for your feature or bug fix:  
   ```git checkout -b feature/your-feature-name```
4. Make your changes and commit them:  
    ```git commit -m "Add your commit message here"```
5. Push your changes to your fork on GitHub:  
    ```git push origin feature/your-feature-name```
6. Create a pull request on GitHub from your forked repository to the main repository.
7. Describe your changes in the pull request, and the maintainers will review your code.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

### Acknowledgments
[Bootstrap](https://getbootstrap.com/) for the awesome CSS framework.  
[jQuery](https://jquery.com/) for DOM manipulation.  
[Sonarr](https://sonarr.tv/) for the awesome TV show management software.  