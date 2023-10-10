//
//  WatchSessionManager.swift
//  watchapp Watch App
//
//  Created by Alexander Harding on 8/2/23.
//

import Foundation
import WatchConnectivity

class WatchSessionManager: NSObject, ObservableObject {
    static let shared = WatchSessionManager()

    @Published var connectedInstance = "lemmy.world" // Variable to hold connected server hostname (optional)
    @Published var authToken: String? // Variable to hold the auth token (optional)

    var loggedIn: Bool {
        get {
           return authToken != nil && authToken != ""
        }
    }

    private override init() {
        super.init()
        activateSession()
    }

    private func activateSession() {
        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = self
            session.activate()

            DispatchQueue.main.async() {
                self.checkForUpdatesToApplicationContext()
            }
        }
    }

    // Check for updates to the application context
    private func checkForUpdatesToApplicationContext() {
        let applicationContext = WCSession.default.receivedApplicationContext

        // Process the received application context data here
        if let connectedInstance = applicationContext["connectedInstance"] as? String {
            self.connectedInstance = connectedInstance

            if let authToken = applicationContext["authToken"] as? String {
                self.authToken = authToken
            } else {
                self.authToken = nil
            }
        }
    }
}

extension WatchSessionManager: WCSessionDelegate {
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        // Handle session activation completion if needed
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        DispatchQueue.main.async {
            // Access the connectedInstance and authToken from the received application context
            if let connectedInstance = applicationContext["connectedInstance"] {
                self.connectedInstance = connectedInstance as! String

                self.authToken = applicationContext["authToken"] as? String
            }
        }
    }
}
