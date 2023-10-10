//
//  APIManager.swift
//  watchapp Watch App
//
//  Created by Alexander Harding on 8/2/23.
//

import Foundation

class APIManager {
    static let shared = APIManager()

    private var instanceHostname: String?

    private init() {}

    func setup(instanceHostname: String) {
        self.instanceHostname = instanceHostname
    }

    func savePost(withID postId: Int, authToken: String, completion: @escaping (Result<Void, Error>) -> Void) {
        guard let foundInstanceHostname = instanceHostname,
              let url = URL(string: "https://\(foundInstanceHostname)/api/v3/post/save")
        else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0, userInfo: nil)))
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload = SavePost(post_id: postId, save: true, auth: authToken)

        do {
            let jsonData = try JSONEncoder().encode(payload)
            request.httpBody = jsonData
        } catch {
            completion(.failure(error))
            return
        }

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }

            if let response = response as? HTTPURLResponse, response.statusCode == 200 {
                completion(.success(()))
            } else {
                completion(.failure(NSError(domain: "Unknown error", code: 0, userInfo: nil)))
            }
        }.resume()
    }
}
