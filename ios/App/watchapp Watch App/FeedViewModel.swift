//
//  FeedViewModel.swift
//  watchapp Watch App
//
//  Created by Alexander Harding on 8/2/23.
//

import SwiftUI
import WatchConnectivity

class FeedViewModel: ObservableObject {
    @Published var posts: [PostView] = []
    @Published var isLoading: Bool = false
    @Published var error: Error? = nil
    @Published var requestConnectedInstance: String?

    private let sessionManager = WatchSessionManager.shared

    private var hasFetchedData = false // New flag to track if data has been fetched once

    func fetchData() {
        if hasFetchedData {
            // Data already fetched once, no need to re-fetch
            return
        }

        let feed = sessionManager.loggedIn ? "Subscribed" : "All"
        let authParam = "&auth=\(self.sessionManager.authToken ?? "")"

        let potentialRequestConnectedInstance = sessionManager.connectedInstance

        guard let url = URL(string: "https://\(potentialRequestConnectedInstance)/api/v3/post/list?page=1&limit=20&sort=Active&type_=\(feed)\(authParam)") else {
            return
        }

        isLoading = true
        error = nil

        let request = URLRequest(url: url)

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Error: \(error)")
                self.error = error
                self.isLoading = false
                return
            }

            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    decoder.keyDecodingStrategy = .convertFromSnakeCase
                    let postData = try decoder.decode(GetPostsResponse.self, from: data)
                    DispatchQueue.main.async {
                        self.isLoading = false
                        self.posts = postData.posts
                        self.requestConnectedInstance = potentialRequestConnectedInstance

                        self.hasFetchedData = true
                    }
                } catch {
                    print("Error parsing JSON: \(error)")
                    self.isLoading = false
                    self.error = error
                }
            }
        }.resume()
    }
}
